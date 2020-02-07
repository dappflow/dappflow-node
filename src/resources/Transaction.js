const transactionResource = (httpClient, wsAgent) => {
  const basePath = 'transactions';

  const transactions = {
    finalize: wsAgent({
      method: 'PATCH',
      path: `apps/{appId}/${basePath}/{txId}/finalize`
    })
  };

  return {transactions};
};

module.exports = transactionResource;
