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
}) => async (params, from) => {
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
  const {result} = await httpClient(body, {appId});

  return result;
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
  const basePath = 'apps';
  const rpcCall = httpClient({
    method: 'POST',
    path: `${basePath}/{appId}/rpc`
  });

  const contracts = {
    list: httpClient({
      method: 'GET',
      path: `${basePath}/{appId}/contracts`
    }),
    callContractMethod: partial(callContractMethod, rpcCall),
    sendTransaction: partial(sendTransaction, rpcCall),
    retrieveInstance: retrieveInstanceHandler(
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
