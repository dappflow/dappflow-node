const sinon = require('sinon');
const qs = require('qs');
const {createAgentRoot} = require('../agent');
const {buildSettings} = require('../coincierge');

const createSpyAgent = (stub = sinon.stub(), key = '', settings = buildSettings({})) => {
  const spy = sinon.spy(stub);

  const spyAgent = createAgentRoot(spy)(key, settings);

  spyAgent.getArgs = (i = 0) => {
    const [fullPath, method, headers, body] = spy.args[i];

    const url = new URL(fullPath);
    return {
      method,
      url,
      body,
      headers,
      query: qs.parse(url.search, {ignoreQueryPrefix: true})
    };
  };

  return spyAgent;
};

module.exports = {
  createSpyAgent
};
