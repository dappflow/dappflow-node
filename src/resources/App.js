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
    create: createAppHandler(wsAgent({path: `/ws${basePath}/create-app`}), token, coincierge, signer),

    fetch: httpAgent({
      method: 'GET',
      path: `${basePath}/{appId}`
    }),

    list: httpAgent({
      method: 'GET',
      path: basePath
    })
  };

  return {apps};
};

module.exports = appResource;
