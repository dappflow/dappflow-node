const transactionResource = ({wsAgent, httpAgent}) => {
  const basePath = 'transactions';

  const transactions = {
    finalize: wsAgent({
      method: 'GET',
      path: `/apps/{appId}/${basePath}/{txId}`
    }),

    list: httpAgent({
      method: 'GET',
      path: '/apps/{appId}/transactions'
    }),

    nonce: httpAgent({
      method: 'GET',
      path: `/apps/{appId}/transactions/blockchain/nonce?from={from}`
    })
  };

  return {transactions};
};

module.exports = transactionResource;
