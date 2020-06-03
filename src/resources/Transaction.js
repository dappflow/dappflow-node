const transactionResource = ({wsAgent, httpAgent, dappflow}) => {
  const {organization: {id: orgId}} = dappflow;
  const basePath = `/organisations/${orgId}/apps/{appId}`;

  const transactions = {
    finalize: wsAgent({
      method: 'GET',
      path: `${basePath}/transactions/{txId}`
    }),

    list: httpAgent({
      method: 'GET',
      path: `${basePath}/transactions`
    })
  };

  return {transactions};
};

module.exports = transactionResource;
