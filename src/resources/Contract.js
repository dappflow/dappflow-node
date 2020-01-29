const validate = require('@coincierge/common/data/validations/validateSmartContractInputs');

const createMethodCalls = ({
  httpClient,
  contract,
  appId,
  coincierge,
  signer
}) => {
  const methods = {};
  contract.abi
    .filter(({type}) => type === 'function')
    .forEach(method => {
      methods[method.name] = method.stateMutability === 'view'
        ? callContractMethod({
          httpClient,
          appId,
          method: method.name,
          contractInterface: contract.interface,
          contractAddress: contract.address,
          methodInputs: method.inputs
        })
        : sendTransaction({
          httpClient,
          appId,
          method: method.name,
          contractInterface: contract.interface,
          contractAddress: contract.address,
          contractId: contract.id,
          methodInputs: method.inputs,
          coincierge,
          signer
        });
    });
  return methods;
};

const sendTransaction = ({
  httpClient,
  appId,
  method,
  contractInterface,
  contractAddress,
  contractId,
  coincierge,
  signer,
  methodInputs
}) => async (params, from) => {
  validate(methodInputs, params);

  const body = {
    method: 'create_transaction',
    parameters: {
      contractInterface,
      contractAddress,
      contractId,
      from,
      method,
      params
    }
  };
  const {result} = await httpClient(body, {appId});
  const {
    nonce,
    to,
    value,
    inputData,
    gasLimit,
    gasPrice,
    id: txId
  } = result;
  const signedTx = await signer(nonce, to, value, inputData, gasLimit, gasPrice);

  return await coincierge.transactions.finalize({signedTx: signedTx.toString('hex')}, {txId, appId});
};

const callContractMethod = ({
  httpClient,
  appId,
  method,
  contractInterface,
  contractAddress,
  methodInputs
}) => (params, from) => {
  validate(methodInputs, params);

  const body = {
    method: 'call_contract_method',
    parameters: {
      contractInterface,
      contractAddress,
      method,
      from,
      params
    }
  };

  return httpClient(body, {appId});
};

const retrieveInstanceHandler = (
  httpClient,
  getInstance,
  coincierge,
  signer
) => async ({appId, contractId}) => {
  const contract = await getInstance({appId, contractId});
  const methods = await createMethodCalls({
    httpClient, contract, appId, coincierge, signer
  });
  return methods;
};

const contractResource = (httpClient, wsAgent, coincierge, signer) => {
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
        path: `${basePath}/{appId}/contracts/{contractId}`
      }),
      coincierge,
      signer
    )
  };

  return {contracts};
};

module.exports = contractResource;
