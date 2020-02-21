const transactionResource = ({wsAgent}) => {
  const basePath = 'transactions';

  const transactions = {
    finalize: wsAgent({
      method: 'GET',
      path: `/ws/apps/{appId}/${basePath}/{txId}`
    })
  };

  return {transactions};
};

module.exports = transactionResource;
