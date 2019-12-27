const testResource = {
  resourcePath: 'test',

  create: {
    method: 'POST',
    path: '/'
  },

  fetch: {
    method: 'GET',
    path: '/{id}'
  },

  del: {
    method: 'DELETE',
    path: '/{id}'
  },

  list: {
    method: 'GET',
    path: '/'
  },

  update: {
    method: 'PUT',
    path: '/{tokenAddress}'
  }
};

module.exports = testResource;
