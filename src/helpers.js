
const contractCallFactory = (state, coincierge) => {
  switch(state) {
    case 'view': return coincierge.contracts.callContractMethod;
    default: return coincierge.contracts.sendTransaction;
  }
};

const createMethodCalls = ({
  contract,
  appId,
  coincierge,
  signer
}) => {
  const methods = {};
  contract.abi
    .filter(({type}) => type === 'function')
    .forEach(method => {
      const contractCall = contractCallFactory(method.stateMutability, coincierge);

      methods[method.name] = contractCall({
        appId,
        method: method.name,
        contractInterface: contract.interface,
        contractAddress: contract.address,
        methodInputs: method.inputs,
        contractId: contract.id,
        coincierge,
        signer
      });
    });

  return methods;
};

module.exports = {
  createMethodCalls
};
