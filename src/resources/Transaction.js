const transactionResource = ({wsAgent}) => {
  const basePath = 'transactions';

  const transactions = {
    finalize: wsAgent({
      method: 'GET',
      path: `apps/{appId}/${basePath}/{txId}/finalize`
    })
  };

  return {transactions};
};

module.exports = transactionResource;
