const transactionResource = ({httpAgent}) => {
  const basePath = 'transactions';

  const transactions = {
    finalize: httpAgent({
      method: 'PATCH',
      path: `apps/{appId}/${basePath}/{txId}/finalize`
    })
  };

  return {transactions};
};

module.exports = transactionResource;
