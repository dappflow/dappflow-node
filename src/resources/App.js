const createAppHandler = (wsClient, coincierge, signer) => async params => {
  wsClient.subscribe(async ws => {
    ws.send(JSON.stringify(params));

    ws.on('message', async message => {
      const {type, data} = JSON.parse(message);

      if(type === 'signable_tx') {
        const signedTx = signer(data.inputData);

        await coincierge.transactions.list();
      }
    });
  });
};

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
      path: `${basePath}/`
    })
  };

  return {apps};
};

module.exports = appResource;
