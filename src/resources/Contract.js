const validate = require('@coincierge/common/data/validations/validateSmartContractInputs');
const {partial} = require('@coincierge/common/fn');
const EventEmitter = require('events');
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
  if(!from) {
    throw new Error(`No 'from' address specified in method call ${method}`);
  }

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

  const res = await coincierge.transactions.finalize({txId, appId});
  const transactionStatusEventEmitter = new EventEmitter();
  res.subscribe(ws => {
    const data = JSON.stringify({signedTx: signedTx.toString('hex')});

    ws.send(data);
    ws.on('message', async message => {
      const {type, ...data} = JSON.parse(message);
      transactionStatusEventEmitter.emit(type, data);
    });
  });

  return transactionStatusEventEmitter;
};

const callContractMethod = (httpAgent, {
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
  const {result} = await httpAgent(body, {appId});

  return result;
};

const getInstanceInstanceHandler = async (
  getInstance,
  coincierge,
  signer,
  {appId, contractId}
) => {
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
  const basePath = 'apps/{appId}';
  const rpcCall = httpAgent({
    method: 'POST',
    path: `${basePath}/rpc`
  });

  const contracts = {
    list: httpAgent({
      method: 'GET',
      path: `${basePath}/contracts`
    }),
    callContractMethod: partial(callContractMethod, rpcCall),
    sendTransaction: partial(sendTransaction, rpcCall),
    getInstance: partial(
      getInstanceInstanceHandler,
      httpAgent({
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
