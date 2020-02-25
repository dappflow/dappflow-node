const https = require('https');
const fetch = require('node-fetch');

// eslint-disable-next-line no-underscore-dangle
const _fetch = async (url, method = 'GET', headers = {}, body) => {
  try {
  // check this https://github.com/bitinn/node-fetch/issues/19#issuecomment-289709519
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const options = {
      method,
      headers,
      agent,
      body
    };

    const response = await fetch(url, options);

    if([400, 401, 403, 404, 422, 500].includes(response.status)) {
      throw new Error(response.statusText);
    }

    if([201, 202, 204].includes(response.status)) {
      return response.text();
    }
    return response.json();
  }
  catch(error) {
    throw Error(`Fetch error: ${error.message}`);
  }
};

module.exports = {
  fetch: _fetch
};
