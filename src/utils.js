const {createQueryString} = require('../../common/helpers/query');
const {ignoreProps} = require('../../common/fn');

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

  return ignoreProps(pathParams)(params);
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
