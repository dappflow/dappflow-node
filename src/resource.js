const resources = require('./resources');
const {constructUrlFromParams} = require('./utils/url');

const httpClient = httpAgent => resourceDetails => {
  const {method, path = ''} = resourceDetails;

  return (...args) => {
    let body;
    let requestParams;
    let headers;

    switch(method) {
      case 'GET':
      case 'DELETE':
        [requestParams] = args;
        break;
      case 'PATCH':
      case 'PUT':
        if(args.length < 2) {
          throw Error('Parameters missing, most likely you have passed only the body.');
        }
      // eslint-disable-next-line no-fallthrough
      case 'POST':
      default:
        [body, requestParams, headers] = args;
    }

    return httpAgent(
      method,
      constructUrlFromParams(path, requestParams),
      body,
      headers
    );
  };
};

const wsClient = wsAgent => resourceDetails => requestParams => {
  const {path = ''} = resourceDetails;

  const url = constructUrlFromParams(path, requestParams);

  return wsAgent(url);
};

const createResourcesRoot = resourcesList => async ({
  httpAgent,
  wsAgent,
  wsServerAgent,
  signer,
  getAccessToken
}) => {
  const organization = await httpAgent('GET', '/orgs');

  return resourcesList
    .reduce(async (prevBuiltResources, resourceBuilder) => {
      const builtResources = await prevBuiltResources;
      const resource = await resourceBuilder({
        httpAgent: httpClient(httpAgent),
        wsAgent: wsClient(wsAgent),
        wsServerAgent: wsClient(wsServerAgent),
        dappflow: builtResources,
        signer,
        getAccessToken
      });

      return Object.assign(builtResources, resource);
    }, Promise.resolve({organization}));
};

module.exports = {
  createResources: createResourcesRoot(resources),
  createResourcesRoot
};
