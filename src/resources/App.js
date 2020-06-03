const {createFormData} = require('../utils/files');
const EventEmitter = require('events');

/* eslint-disable no-case-declarations */
const createAppHandler = (
  wsClient,
  token,
  dappflow,
  signer
) => async (params, options) => {
  const appStatusEventEmitter = new EventEmitter();
  const {organization: {id: orgId}} = dappflow;
  const {from, network} = options;

  wsClient({orgId}).subscribe(async ws => {
    ws.send(JSON.stringify({token}));

    ws.on('message', async message => {
      const {type, data} = JSON.parse(message);

      switch(type) {
        case 'signable_tx':
          const {
            to,
            value,
            inputData,
            gasLimit,
            gasPrice,
            id: txId,
            appId
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
          const sub = await dappflow.transactions.finalize({txId, appId});

          sub.subscribe(ws => {
            const data = JSON.stringify({signedTx: signedTx.toString('hex')});

            ws.send(data);
            ws.on('message', async message => {
              const {type, ...data} = JSON.parse(message);

              appStatusEventEmitter.emit(type, {...data, txId});
            });
          });

          break;
        case 'complete':
          appStatusEventEmitter.emit(type, data);
          ws.close();

          break;
        case 'authorize':
          ws.send(JSON.stringify({...params, network}));

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
}

const appResource = async ({
  httpAgent,
  wsAgent,
  dappflow,
  signer,
  getAccessToken
}) => {
  const basePath = '/organisations/{orgId}/apps';
  const token = await getAccessToken();

  const apps = {
    create: createAppHandler(wsAgent({path: `${basePath}/create-app`}), token, dappflow, signer),

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
