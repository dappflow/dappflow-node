const contractCallFactory = (state, dappflow) => {
  switch(state) {
    case 'view': return dappflow.contracts.callContractMethod;
    default: return dappflow.contracts.sendTransaction;
  }
};

const createMethodCalls = ({
  contract,
  appId,
  dappflow,
  signer
}) => {
  const methods = {};
  contract.abi
    .filter(({type}) => type === 'function')
    .forEach(method => {
      const contractCall = contractCallFactory(method.stateMutability, dappflow);

      methods[method.name] = contractCall({
        appId,
        method: method.name,
        contractInterface: contract.interface,
        contractAddress: contract.address,
        methodInputs: method.inputs,
        contractId: contract.id,
        dappflow,
        signer,
        network: contract.chainId
      });
    });

  return methods;
};

module.exports = {
  createMethodCalls
};
