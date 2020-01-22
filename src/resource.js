const resources = require('./resources');
const {constructUrlFromParams} = require('./utils');

const httpClient = httpAgent => resourceDetails => {
  const {method, path = ''} = resourceDetails;

  return (...args) => {
    let body;
    let requestParams;

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
        [body, requestParams] = args;
    }

    return httpAgent(
      method,
      constructUrlFromParams(path, requestParams),
      body
    );
  };
};

const wsClient = wsAgent => resourceDetails => {
  const {path = ''} = resourceDetails;

  return wsAgent(path);
};

const createResourcesRoot = resourcesList => (httpAgent, wsAgent, signer, orgId) => resourcesList
  .reduce((builtResources, resourceBuilder) => Object.assign(
    builtResources,
    resourceBuilder(httpClient(httpAgent), wsClient(wsAgent), builtResources, signer, orgId)
  ), {});

module.exports = {
  createResources: createResourcesRoot(resources),
  createResourcesRoot
};
