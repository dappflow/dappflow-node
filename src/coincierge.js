const {getAccessToken, createHttpAgent, createWsAgent} = require('./agent');
const {createResources} = require('./resource');

const SETTINGS = {
  host: 'localhost',
  httpPort: '8445',
  wsPort: '8445'
};

const init = async ({clientSecret, clientId}, signer) => {
  const key = await getAccessToken({clientSecret, clientId});

  const httpAgent = createHttpAgent(key, SETTINGS);
  const org = await httpAgent('GET', `orgs?clientId=${clientId}`);
  const wsAgent = createWsAgent(key, SETTINGS);

  const coincierge = {
    ...createResources(httpAgent, wsAgent, signer, org.id),
    settings: SETTINGS // helpful to retrieve the current settings used
  };

  return coincierge;
};

module.exports = {
  init
};
