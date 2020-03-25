const blockchainResource = ({httpAgent}) => {
  const blockchain = {
    nonce: httpAgent({
      method: 'GET',
      path: `/blockchain/addresses/{address}/nonce`
    })
  };

  return {blockchain};
};

module.exports = blockchainResource;
