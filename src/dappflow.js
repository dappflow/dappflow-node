const {getAccessToken, createHttpAgent, createWsAgent} = require('./agent');
const {createResources} = require('./resource');
const {signer: sdkSigner} = require('./signer');

const SETTINGS = {
  host: 'localhost',
  httpPort: '8445',
  wsPort: '8445'
};

const init = async ({clientSecret, clientId, privKey}, signer = sdkSigner(privKey)) => {
  const httpAgent = createHttpAgent({clientSecret, clientId}, SETTINGS);
  const wsAgent = createWsAgent({clientSecret, clientId}, SETTINGS);
  const resources = await createResources({
    httpAgent,
    wsAgent,
    signer,
    getAccessToken: getAccessToken({clientSecret, clientId})
  });

  const dappflow = {
    ...resources,
    settings: SETTINGS // helpful to retrieve the current settings used
  };

  return dappflow;
};

module.exports = {
  init
};
