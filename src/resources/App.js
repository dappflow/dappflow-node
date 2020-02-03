/* eslint-disable no-case-declarations */
const createAppHandler = (
  wsClient,
  token,
  coincierge,
  signer
) => async ({orgId, ...params}) => new Promise((res, rej) => {
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
            gasPrice
          });
          await coincierge.transactions.finalize({signedTx: signedTx.toString('hex')}, {txId, appId});

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

const appResource = async (httpClient, wsAgent, coincierge, signer, getAccessToken) => {
  const basePath = 'orgs/{orgId}/apps';
  const token = await getAccessToken();

  const apps = {
    create: createAppHandler(wsAgent({path: `${basePath}/create-app`}), token, coincierge, signer),

    fetch: httpClient({
      method: 'GET',
      path: `${basePath}/{appId}`
    }),

    list: httpClient({
      method: 'GET',
      path: basePath
    })
  };

  return {apps};
};

module.exports = appResource;
