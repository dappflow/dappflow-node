/* eslint-disable no-case-declarations */
const createAppHandler = (
  wsClient,
  coincierge,
  signer
) => async params => new Promise((res, rej) => {
  wsClient.subscribe(async ws => {
    ws.send(JSON.stringify(params));

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

          const signedTx = await signer(nonce, to, value, inputData, gasLimit, gasPrice);

          await coincierge.transactions.finalize({signedTx: signedTx.toString('hex')}, {txId, appId});
          break;

        case 'complete':
          res(data);
          ws.close();
          break;

        default:
          console.log(data);
          break;
      }
    });
    ws.on('error', rej);
  });
});

const appResource = (httpClient, wsAgent, coincierge, signer) => {
  const basePath = 'apps';

  const apps = {
    create: createAppHandler(wsAgent({path: `${basePath}/create-app`}), coincierge, signer),

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
