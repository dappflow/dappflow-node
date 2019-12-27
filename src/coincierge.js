const {createAgent} = require('./agent');
const {createResources} = require('./resource');
const packageVersion = require('../package.json').version;

const DEFAULTS = {
  host: 'https://api.coincierge.io',
  port: ':8445',
  api_version: '',
  timeout: require('https').createServer().timeout,
  package_version: packageVersion,
  max_network_retry_delay_sec: 2,
  network_max_retry: 5,
  initial_network_retry_delay_sec: 0.5,
  user_agent: {
    lang: 'node',
    lang_version: process.version,
    platform: process.platform,
    publisher: 'coincierge'
  }
};

const buildSettings = custom => {
  const {
    user_agent = {},
    ...rest
  } = custom;

  return {
    ...DEFAULTS,
    user_agent: {
      ...DEFAULTS.user_agent,
      ...user_agent
    },
    ...rest
  };
};

const init = (key, customSettings = {}) => {
  const settings = buildSettings(customSettings);
  const agent = createAgent(key, settings);

  return {
    ...createResources(agent),
    initialSettings: settings, // helpful to retrieve the current settings used
    utils: {} // utils like verify signatures, Oath token generation, etc.
  };
};

module.exports = {
  init,
  buildSettings
};
