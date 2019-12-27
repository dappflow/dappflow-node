const {identity} = require('../../../common/fn');

const tokenResource = {
  resourcePath: 'tokens',

  create: {
    method: 'POST',
    path: '/'
  },

  fetch: {
    method: 'GET',
    path: '/{tokenAddress}'
  },

  list: {
    method: 'GET',
    path: '/'
  },

  createDocument: {
    method: 'POST',
    path: '/{tokenAddress}/documents'
  },

  update: {
    method: 'PUT',
    path: '/{tokenAddress}'
  },

  getBalances: {
    method: 'GET',
    path: '/{tokenAddress}/balances'
  },

  fetchTransfers: {
    method: 'GET',
    path: '/{tokenAddress}/transfers'
  },

  createAndSign: tokenEndpoints => async (body, signer, verifier = identity) => {
    const response = await tokenEndpoints.create(body);
    const signed = signer(verifier(response.rawTx));
    const updateResponse = await tokenEndpoints.update(response, {...response, signed});

    return updateResponse;
  }
};

module.exports = tokenResource;
