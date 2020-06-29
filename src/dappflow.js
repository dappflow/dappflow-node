const {getAccessToken, createHttpAgent, createWsAgent} = require('./agent');
const {createResources} = require('./resource');
const {signer: sdkSigner} = require('./signer');

const SETTINGS = {
  host: 'api.dappflow.com'
};

const SETTINGS_WS = {
  host: 'ws.dappflow.com'
};

const init = async ({clientSecret, clientId, privKey}, signer = sdkSigner(privKey)) => {
  const httpAgent = createHttpAgent({clientSecret, clientId}, SETTINGS);
  const wsAgent = createWsAgent({clientSecret, clientId}, SETTINGS);
  const wsServerAgent = createWsAgent({clientSecret, clientId}, SETTINGS_WS);
  const resources = await createResources({
    httpAgent,
    wsAgent,
    wsServerAgent,
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
