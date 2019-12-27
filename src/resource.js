const resources = require('./resources');
const {constructUrlFromParams} = require('./utils');
const {head, isFunction, identity} = require('../../common/fn');

const buildEndpoint = (endpoint, resourcePath, agent) => {
  const {
    method,
    path = '',
    requestDataProcessor = identity,
    responseHandler = identity
  } = endpoint;

  const makeRequest = async (body, requestParams) => {
    const url = `${resourcePath}${constructUrlFromParams(path, requestParams)}`;

    const response = await agent(
      method,
      url,
      requestDataProcessor(body)
    );

    return responseHandler(response);
  };

  return (...args) => {
    let body;
    let query;

    switch(method) {
      case 'GET':
      case 'DELETE':
        [query] = args;
        break;
      case 'PATCH':
      case 'PUT':
        if(args.length < 2) {
          throw Error('Parameters missing, most likely you have passed only the body.');
        }
      // eslint-disable-next-line no-fallthrough
      case 'POST':
      default:
        [body, query] = args;
    }

    return makeRequest(body, query);
  };
};

const buildResource = (resource, agent) => {
  const {resourcePath, ...endpoints} = resource;

  const builtEndpoints = Object
    .entries(endpoints)
    .reduce((resourceEndpoints, [actionName, actionDetails]) => {
      const resourceActions = {
        ...resourceEndpoints,
        [actionName]: isFunction(actionDetails)
          ? actionDetails(resourceEndpoints)
          : buildEndpoint(actionDetails, resourcePath, agent)
      };

      return resourceActions;
    }, {});

  return builtEndpoints;
};

const createResourcesRoot = resourcesList => agent => resourcesList.reduce((acc, curr) => ({
  ...acc,
  [curr.resourcePath]: buildResource(curr, agent)
}), {});

module.exports = {
  createResources: createResourcesRoot(resources),
  createResourcesRoot
};
