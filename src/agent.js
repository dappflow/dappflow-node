const WebSocket = require('ws');
const {Observable} = require('rxjs');
const uuid4 = require('uuid/v4');
const {removeNullProperties} = require('@coincierge/common/fn');
const {fetch} = require('@coincierge/common/helpers/api');
const {requestHandler} = require('./requestHandler');

const createHttpAgentRoot = fetch => (key, settings) => {
  const port = settings.httpPort
    ? `:${settings.httpPort}`
    : '';

  const apiUrl = `https://${settings.host}${port}/`;

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
      JSON.stringify(body)
    );

    return requestHandler(request);
  };
};

const createWsAgentRoot = WebSocket => (key, settings) => {
  const port = settings.wsPort
    ? `:${settings.wsPort}`
    : '';

  return path => new Observable(subscriber => {
    const wsUri = `wss://${settings.host}${port}/${path}`;

    const client = new WebSocket(wsUri);
    client.on('open', () => subscriber.next(client));
    client.on('error', err => subscriber.error(err));
  });
};

module.exports = {
  createHttpAgentRoot,
  createHttpAgent: createHttpAgentRoot(fetch),
  createWsAgentRoot,
  createWsAgent: createWsAgentRoot(WebSocket)
};
