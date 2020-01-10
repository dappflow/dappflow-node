process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const {createHttpAgent, createWsAgent} = require('./agent');
const {createResources} = require('./resource');

const SETTINGS = {
  host: 'localhost',
  httpPort: '8445',
  wsPort: '9444'
};

const init = (key, privKey, signer) => {
  const httpAgent = createHttpAgent(key, SETTINGS);
  const wsAgent = createWsAgent(key, SETTINGS);

  const coincierge = {
    ...createResources(httpAgent, wsAgent, signer),
    settings: SETTINGS // helpful to retrieve the current settings used
  };

  return coincierge;
};

const coincierge = init('123');

coincierge.apps.create({
  templateName: 'CNG1400',
  params: {
    owner: '0xF7b547f3E46EFfB3480EEE2c486AE760734B135c',
    name: 'name',
    symbol: 'symbol',
    decimals: 18
  },
  appId: '123'
});

module.exports = {
  init
};
