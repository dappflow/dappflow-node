const WebSocket = require('ws');
const {reject, isNil} = require('rambda');
const {URLSearchParams} = require('url');
const decode = require('jwt-decode');
const {Observable} = require('rxjs');
const uuid4 = require('uuid/v4');
const {fetch} = require('./utils/api');
const {requestHandler} = require('./requestHandler');

const getTokenExpirationDate = encodedToken => {
  const token = decode(encodedToken);
  if(!token.exp) {
    return null;
  }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);

  return date;
};

const isTokenExpired = token => {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
};

let _accessToken;

const getAccessToken = ({clientId, clientSecret}) => async () => {
  if(_accessToken && !isTokenExpired(_accessToken)) {
    return _accessToken;
  }

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

  _accessToken = grant.access_token;

  return _accessToken;
};

const createHttpAgentRoot = fetch => ({clientId, clientSecret}, settings) => {
  const port = settings.httpPort
    ? `:${settings.httpPort}`
    : '';

  const apiUrl = `https://${settings.host}${port}`;

  return async (method, path, body, customHeaders) => {
    const accessToken = await getAccessToken({clientId, clientSecret})();

    const defaultHeaders = customHeaders || {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Idempotency-Key': method === 'POST' && settings.network_max_retry > 0
        ? `dappflow-node-retry-${uuid4()}`
        : null,
      ...defaultHeaders
    };

    const safeBody = headers['Content-Type'].includes('application/json') ? JSON.stringify(body) : body;
    const request = fetch(
      apiUrl + path,
      method,
      reject(isNil)(headers),
      safeBody
    );

    return requestHandler(request);
  };
};

const createWsAgentRoot = WebSocket => ({clientId, clientSecret}, settings) => {
  const port = settings.wsPort
    ? `:${settings.wsPort}`
    : '';

  return path => new Observable(async subscriber => {
    const accessToken = await getAccessToken({clientId, clientSecret})();
    const wsUri = `wss://${settings.host}${port}/ws${path}`;

    const headers = {
      Authorization: `Bearer ${accessToken}`
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
