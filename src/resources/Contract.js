const validate = require('@coincierge/common/data/validations/validateSmartContractInputs');
const {partial} = require('@coincierge/common/fn');
const {createMethodCalls} = require('../helpers');

const sendTransaction = (httpAgent, {
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
  const {result} = await httpAgent(body, {appId});
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

const callContractMethod = (httpAgent, {
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

  return httpAgent(body, {appId});
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

const contractResource = ({
  httpAgent,
  coincierge,
  signer
}) => {
  const basePath = 'apps';
  const rpcCall = httpAgent({
    method: 'POST',
    path: `${basePath}/{appId}/rpc`
  });

  const contracts = {
    list: httpAgent({
      method: 'GET',
      path: `${basePath}/{appId}/contracts`
    }),
    callContractMethod: partial(callContractMethod, rpcCall),
    sendTransaction: partial(sendTransaction, rpcCall),
    retrieveInstance: retrieveInstanceHandler(
      httpAgent({
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
