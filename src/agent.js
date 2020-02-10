const WebSocket = require('ws');
const {URLSearchParams} = require('url');
const {Observable} = require('rxjs');
const uuid4 = require('uuid/v4');
const {removeNullProperties} = require('@coincierge/common/fn');
const {fetch} = require('@coincierge/common/helpers/api');
const {requestHandler} = require('./requestHandler');

const getAccessToken = ({clientId, clientSecret}) => async () => {
  const params = new URLSearchParams();
  params.set('grant_type', 'client_credentials');
  params.set('client_id', clientId);
  params.set('client_secret', clientSecret);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const grant = await fetch(
    'https://auth.coincierge.io/auth/realms/coincierge-local/protocol/openid-connect/token',
    'POST',
    headers,
    params
  );

  return grant.access_token;
};

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

    const headers = {
      Authorization: `Bearer ${key}`
    };

    const client = new WebSocket(wsUri, undefined, {headers});
    client.on('open', () => subscriber.next(client));
    client.on('error', err => subscriber.error(err));
  });
};

module.exports = {
  getAccessToken,
  createHttpAgentRoot,
  createHttpAgent: createHttpAgentRoot(fetch),
  createWsAgentRoot,
  createWsAgent: createWsAgentRoot(WebSocket)
};
