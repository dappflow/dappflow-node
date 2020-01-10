const transactionResource = httpClient => {
  const basePath = 'transactions';

  const transactions = {
    finalize: httpClient({
      method: 'PATCH',
      path: `apps/{appId}/${basePath}/{txId}/finalize`
    })
  };

  return {transactions};
};

module.exports = transactionResource;
