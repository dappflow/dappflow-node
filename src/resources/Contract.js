const validate = require('@coincierge/common/data/validations/validateSmartContractInputs');
const {partial} = require('@coincierge/common/fn');
const {createMethodCalls} = require('../helpers');

const sendTransaction = (httpClient, {
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
  const signedTx = await signer({
    nonce,
    to,
    value,
    data: inputData,
    gasLimit,
    gasPrice
  });

  return await coincierge.transactions.finalize({signedTx: signedTx.toString('hex')}, {txId, appId});
};

const callContractMethod = (httpClient, {
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
  getInstance,
  coincierge,
  signer
) => async ({appId, contractId}) => {
  const contract = await getInstance({appId, contractId});

  return await createMethodCalls({
    contract,
    appId,
    coincierge,
    signer
  });
};

const contractResource = (httpClient, wsAgent, coincierge, signer) => {
  const basePath = 'apps/{appId}';
  const rpcCall = httpClient({
    method: 'POST',
    path: `${basePath}/rpc`
  });

  const contracts = {
    list: httpClient({
      method: 'GET',
      path: `${basePath}/contracts`
    }),
    callContractMethod: partial(callContractMethod, rpcCall),
    sendTransaction: partial(sendTransaction, rpcCall),
    retrieveInstance: retrieveInstanceHandler(
      httpClient({
        method: 'GET',
        path: `${basePath}/contracts/{contractId}`
      }),
      coincierge,
      signer
    ),
    transfers: httpClient({
      method: 'GET',
      path: `${basePath}/tokens/{contractAddress}/transfers`
    })
  };

  return {contracts};
};

module.exports = contractResource;
