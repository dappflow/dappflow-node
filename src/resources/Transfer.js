const transferResource = {
  resourcePath: 'transactions',

  list: {
    method: 'GET',
    path: '/tokens/{tokenAddress}/transfers'
  },

  fetch: {
    method: 'GET',
    path: '/{txHash}'
  }
};

module.exports = transferResource;
