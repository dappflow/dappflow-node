const EventEmitter = require('events');
const {createFormData} = require('../utils/files');
const {parseYaml, toYaml} = require('../utils/yaml');

const TEMPLATE_DEPLOYMENT_MESSAGES = {
  START_DEPLOYMENT: 'start_deployment',
  TX_TRANSMITTED: 'tx_transmitted',
  TX_REJECTED: 'tx_rejected',
  TRANSMIT_TX: 'transmit_tx'
};

const merge = (target, source) => {
  for(const key of Object.keys(source)) {
    if(source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]));
  }

  Object.assign(target || {}, source);
  return target;
};

/* eslint-disable no-case-declarations */
const createAppHandler = (
  wsClient,
  httpClient,
  token,
  dappflow,
  signer
) => async params => {
  const appStatusEventEmitter = new EventEmitter();
  const {organization: {id: orgId}} = dappflow;
  const {template: templateName, ...templateParams} = params;
  const {template} = await httpClient({orgId, template: templateName});
  const {from} = templateParams.spec.contracts[0];
  const network = 42;
  const mergedTemplate = merge(parseYaml(template), templateParams);

  wsClient().subscribe(async ws => {
    ws.send(JSON.stringify({token}));

    ws.on('message', async message => {
      const {type, data, appId} = JSON.parse(message);

      switch(type) {
        case 'signable_tx':
          const {
            to,
            value,
            inputData,
            gasLimit,
            gasPrice,
            id: txId,
            sessionId
          } = data;
          appStatusEventEmitter.emit(type, data);

          const {nonce} = await dappflow.blockchain.nonce({address: from, network});
          const signedTx = await signer({
            nonce,
            to,
            value,
            data: inputData,
            gasLimit,
            gasPrice
          });
          const body = {
            signedTx,
            txId,
            sessionId,
            chainId: network
          };

          ws.send(JSON.stringify({
            ...body,
            type: TEMPLATE_DEPLOYMENT_MESSAGES.TRANSMIT_TX
          }));

          break;
        case 'complete':
          appStatusEventEmitter.emit(type, {appId});
          ws.close();

          break;
        case 'authorize':
          ws.send(JSON.stringify({
            orgId,
            template: toYaml(mergedTemplate),
            type: TEMPLATE_DEPLOYMENT_MESSAGES.START_DEPLOYMENT
          }));

          break;
        default:
          appStatusEventEmitter.emit(type, data);

          break;
      }
    });
    ws.on('error', error => {
      appStatusEventEmitter.emit('error', error);
    });
  });

  return appStatusEventEmitter;
};

const uploadAppTemplate = (httpAgent, dappflow) => templatePath => {
  const {organization: {id: orgId}} = dappflow;
  const formData = createFormData(templatePath, ['.yml']);

  return httpAgent(formData, {orgId}, formData.getHeaders());
};

const listApps = (httpAgent, dappflow) => () => {
  const {organization: {id: orgId}} = dappflow;

  return httpAgent({orgId});
};

const appResource = async ({
  httpAgent,
  wsServerAgent,
  dappflow,
  signer,
  getAccessToken
}) => {
  const basePath = '/orgs/{orgId}/apps';
  const token = await getAccessToken();

  const apps = {
    create: createAppHandler(
      wsServerAgent({path: '/apps'}),
      httpAgent({path: '/apps/template/{template}', method: 'GET'}),
      token,
      dappflow,
      signer
    ),

    fetch: httpAgent({
      method: 'GET',
      path: '/apps/{appId}'
    }),

    list: listApps(
      httpAgent({
        method: 'GET',
        path: basePath
      }),
      dappflow
    ),

    uploadTemplate: uploadAppTemplate(httpAgent({
      method: 'POST',
      path: `${basePath}/upload-template`
    }), dappflow)
  };

  return {apps};
};

module.exports = appResource;
