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
    })
  };

  return {transactions};
};

module.exports = transactionResource;
