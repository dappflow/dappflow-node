const uuid4 = require('uuid/v4');
const {removeNullProperties} = require('../../common/fn');
const {fetch} = require('../../common/helpers/api');
const {requestHandler} = require('./requestHandler');

const createAgentRoot = fetch => (key, settings) => {
  const apiUrl = `${settings.host}${settings.port || ''}${settings.api_version}/`;

  return async (method, path, body) => {
    const headers = {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Idempotency-Key': method === 'POST' && settings.network_max_retry > 0
        ? `coincierge-node-retry-${uuid4()}`
        : null
    };

    const request = fetch(
      apiUrl + path,
      method,
      removeNullProperties(headers),
      body
    );

    return requestHandler(request);
  };
};

module.exports = {
  createAgent: createAgentRoot(fetch),
  createAgentRoot
};
