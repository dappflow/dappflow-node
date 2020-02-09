const {getAccessToken, createHttpAgent, createWsAgent} = require('./agent');
const {createResources} = require('./resource');
const {signer: sdkSigner} = require('./signer');

const SETTINGS = {
  host: 'localhost',
  httpPort: '8445',
  wsPort: '8445'
};

const init = async ({clientSecret, clientId, privKey}, signer = sdkSigner(privKey)) => {
  const key = await getAccessToken({clientSecret, clientId});

  const httpAgent = createHttpAgent(key, SETTINGS);
  const wsAgent = createWsAgent(key, SETTINGS);
  const resources = await createResources(httpAgent, wsAgent, signer);

  const coincierge = {
    ...resources,
    settings: SETTINGS // helpful to retrieve the current settings used
  };

  return coincierge;
};

module.exports = {
  init
};
