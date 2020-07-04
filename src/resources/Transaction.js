const transactionResource = ({wsServerAgent, httpAgent, dappflow}) => {
  const {organization: {id: orgId}} = dappflow;
  const basePath = `/orgs/${orgId}/apps/{appId}`;

  const transactions = {
    finalize: wsServerAgent({
      method: 'GET',
      path: '/transactions'
    }),

    list: httpAgent({
      method: 'GET',
      path: `${basePath}/transactions`
    })
  };

  return {transactions};
};

module.exports = transactionResource;
