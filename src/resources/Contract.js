const createMethodCalls = (rpcCall, contract, appId) => {
  const methods = {};
  contract.abi
    .filter(({type}) => type === 'function')
    .forEach(method => {
      methods[method.name] = method.stateMutability === 'view'
        ? callContractMethod({
          rpcCall,
          appId,
          method: method.name,
          contractInterface: contract.interface,
          contractAddress: contract.address
        })
        : sendTransaction({
          rpcCall,
          appId,
          method: method.name,
          contractInterface: contract.interface,
          contractAddress: contract.address
        });
    });
  return methods;
};

const sendTransaction = ({
  rpcCall,
  appId,
  method,
  contractInterface,
  contractAddress
}) => params => {
  const body = {
    method: 'create_transaction',
    parameters: {
      contractInterface,
      contractAddress,
      method,
      params
    }
  };
  return rpcCall(body, {appId});
};
const callContractMethod = ({
  rpcCall,
  appId,
  method,
  contractInterface,
  contractAddress
}) => params => {
  const body = {
    method: 'call_contract_method',
    parameters: {
      contractInterface,
      contractAddress,
      method,
      args: params
    }
  };

  return rpcCall(body, {appId});
};

const retrieveInstanceHandler = (httpClient, getInstance, ...params) => async ({appId, contractId}) => {
  const contract = await getInstance({appId, contractId});
  const methods = await createMethodCalls(httpClient, contract, appId);
  return methods;
};

const contractResource = httpClient => {
  const basePath = 'apps';

  const contracts = {
    list: httpClient({
      method: 'GET',
      path: `${basePath}/{appId}/contracts`
    }),

    retrieveInstance: retrieveInstanceHandler(
      httpClient({
        method: 'POST',
        path: `${basePath}/{appId}/rpc`
      }),
      httpClient({
        method: 'GET',
        path: `${basePath}/{appId}/contracts/{contractId}/instance`
      })
    )
  };

  return {contracts};
};

module.exports = contractResource;
