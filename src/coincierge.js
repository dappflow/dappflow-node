process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.ETHEREUM_NETWORK = 'kovan';

const {signTransaction} = require('@coincierge/eth-utils/core/v1/tx');
const {getAccessToken, createHttpAgent, createWsAgent} = require('./agent');
const {createResources} = require('./resource');

const signer = privKey => (...args) => signTransaction(privKey, ...args);

const SETTINGS = {
  host: 'localhost',
  httpPort: '8445',
  wsPort: '8445'
};

const init = async ({clientSecret, clientId}, signer) => {
  const key = await getAccessToken({clientSecret, clientId});

  const httpAgent = createHttpAgent(key, SETTINGS);
  const wsAgent = createWsAgent(key, SETTINGS);

  const coincierge = {
    ...createResources(httpAgent, wsAgent, signer),
    settings: SETTINGS // helpful to retrieve the current settings used
  };

  return coincierge;
};

(async () => {
  const coincierge = await init(
    {
      clientSecret: 'e9e6b6f4060dac0eae328390069d7598a86ae8bbb1f906727ccb8c8b65460fd5',
      clientId: '-2906f04d-0a95-4225-b7f0-01da02c8211f'
    },
    signer('80d71aa58d06582d8af8cfa58ba053d76ab0158e9e9fd58bf0ba7292c3233f4a')
  );

  // const newApp = await coincierge.apps.create({
  //   templateName: 'CNG1400',
  //   params: {
  //     owner: '0xF7b547f3E46EFfB3480EEE2c486AE760734B135c',
  //     name: 'name',
  //     symbol: 'symbol',
  //     decimals: 18
  //   },
  //   orgId: 'de9421b8-418b-4a4e-a80e-3bcfd4b0d0e1'
  // });

  const contracts = await coincierge.contracts.list({appId: '1b76d8f4-573f-49c0-bd63-f786e5d16eeb'});
  return contracts;
})();

module.exports = {
  init
};
