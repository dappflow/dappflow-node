const {omit} = require('rambda');
const qs = require('qs');

const createQueryString = (obj = {}, options = {}) => {
  const {
    skipNulls = true,
    ...rest
  } = options;

  return qs.stringify(obj, {skipNulls, ...rest});
};

/*
  By looking at the url, we can interpolate params
  for example: /resource/{resourceId}/do-something/{somethingData}
  should expect {resourceId, somethingData} as params.
*/
const interpolateUrl = (path, params) => {
  const pattern = /{\s*(\w+?)\s*}/g; // {property}

  return path.replace(pattern, (_, key) => {
    if(!params[key]) {
      throw Error(`Missing ${key} param.`);
    }
    return params[key];
  });
};

const getPathParams = path => {
  const pathParams = path.match(/\{\w+\}/g) || [];

  return pathParams.map(param => param.replace(/[{}]/g, ''));
};

const excludePathParams = (path, params) => {
  const pathParams = getPathParams(path);

  return omit(pathParams)(params);
};

const pathRequiresParams = path => Boolean(getPathParams(path).length);

const constructUrlFromParams = (path, params = {}) => {
  const str = String().concat(
    interpolateUrl(path, params),
    createQueryString(excludePathParams(path, params), {addQueryPrefix: true})
  );

  return str;
};

module.exports = {
  interpolateUrl,
  constructUrlFromParams,
  excludePathParams,
  pathRequiresParams
};
