const {partial} = require('@coincierge/common/fn');
const {getAccessToken, createHttpAgent, createWsAgent} = require('./agent');
const {createResources} = require('./resource');

const SETTINGS = {
  host: 'localhost',
  httpPort: '8445',
  wsPort: '8445'
};

const init = async ({clientSecret, clientId}, privKey, signer) => {
  const key = await getAccessToken({clientSecret, clientId});

  const httpAgent = createHttpAgent(key, SETTINGS);
  const wsAgent = createWsAgent(key, SETTINGS);

  const coincierge = {
    ...createResources(httpAgent, wsAgent, partial(signer, privKey)),
    settings: SETTINGS // helpful to retrieve the current settings used
  };

  return coincierge;
};

module.exports = {
  init
};
