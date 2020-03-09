const {createFormData} = require('../utils/files');

/* eslint-disable no-case-declarations */
const createAppHandler = (
  wsClient,
  token,
  coincierge,
  signer
) => async ({...params}) => new Promise((res, rej) => {
  const {organization: {id: orgId}} = coincierge;

  wsClient({orgId}).subscribe(async ws => {
    ws.send(JSON.stringify({token}));

    ws.on('message', async message => {
      const {type, data} = JSON.parse(message);

      switch(type) {
        case 'signable_tx':
          const {
            nonce,
            to,
            value,
            inputData,
            gasLimit,
            gasPrice,
            id: txId,
            appId
          } = data;

          const signedTx = await signer({
            nonce,
            to,
            value,
            data: inputData,
            gasLimit,
            gasPrice: `0x${gasPrice}`
          });
          const sub = await coincierge.transactions.finalize({txId, appId});
          sub.subscribe(ws => {
            const data = JSON.stringify({signedTx: signedTx.toString('hex')});

            ws.send(data);
          });

          break;
        case 'complete':
          res(data);
          ws.close();

          break;
        case 'authorize':
          ws.send(JSON.stringify(params));

          break;
        default:

          break;
      }
    });
    ws.on('error', rej);
  });
});

const uploadAppTemplate = (httpAgent, coincierge) => templatePath => {
  const {organization: {id: orgId}} = coincierge;
  const formData = createFormData(templatePath, ['.yml']);

  return httpAgent(formData, {orgId}, formData.getHeaders());
};

const appResource = async ({
  httpAgent,
  wsAgent,
  coincierge,
  signer,
  getAccessToken
}) => {
  const basePath = '/orgs/{orgId}/apps';
  const token = await getAccessToken();

  const apps = {
    create: createAppHandler(wsAgent({path: `${basePath}/create-app`}), token, coincierge, signer),

    fetch: httpAgent({
      method: 'GET',
      path: `${basePath}/{appId}`
    }),

    list: httpAgent({
      method: 'GET',
      path: basePath
    }),

    uploadTemplate: uploadAppTemplate(httpAgent({
      method: 'POST',
      path: `${basePath}/upload`
    }), coincierge)
  };

  return {apps};
};

module.exports = appResource;
