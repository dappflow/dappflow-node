const {partial} = require('rambda');
const EventEmitter = require('events');
const validate = require('../utils/smartContract');
const {createMethodCalls} = require('../helpers');

const sendTransaction = (httpAgent, {
  appId,
  method,
  contractId,
  dappflow,
  signer,
  methodInputs
}) => async (params, from) => {
  if(!from) {
    throw new Error(`No 'from' address specified in method call ${method}`);
  }

  validate(methodInputs, params);

  const body = {
    method,
    parameters: {
      from,
      params
    }
  };
  const {result} = await httpAgent(body, {appId, contractId});
  const {
    to,
    value,
    inputData,
    gasLimit,
    gasPrice,
    id: txId
  } = result;
  const {nonce} = await dappflow.blockchain.nonce({address: from});
  const signedTx = await signer({
    nonce,
    to,
    value,
    data: inputData,
    gasLimit,
    gasPrice
  });

  const res = await dappflow.transactions.finalize({txId, appId});
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
  methodInputs,
  contractId
}) => async (params, from) => {
  validate(methodInputs, params);

  const body = {
    method,
    parameters: {
      from,
      params
    }
  };
  const {result} = await httpAgent(body, {appId, contractId});

  return result;
};

const listContractTransactions = (httpAgent, contractId, appId) => () => {
  return httpAgent({contractId, appId});
}

const listContractEvents = (httpAgent, contractId, appId) => filters => {
  return httpAgent({...filters, contractId, appId});
}

const getInstanceInstanceHandler = async (
  getInstance,
  dappflow,
  signer,
  httpAgent,
  {appId, contractId}
) => {
  const contract = await getInstance({appId, contractId});
  const methodCalls = await createMethodCalls({
    contract,
    appId,
    dappflow,
    signer
  });

  return {
    ...methodCalls,
    transactions: listContractTransactions(
      httpAgent({
        method: 'GET',
        path: '/apps/{appId}/transactions'
      }),
      contractId,
      appId
    ),
    events: listContractEvents(
      httpAgent({
        method: 'GET',
        path: '/apps/{appId}/events'
      }),
      contractId,
      appId
    )
  }
};

const contractResource = ({
  httpAgent,
  dappflow,
  signer
}) => {
  const basePath = '/apps/{appId}';
  const rpcCall = httpAgent({
    method: 'POST',
    path: `${basePath}/contracts/{contractId}/rpc`
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
      dappflow,
      signer,
      httpAgent
    ),
    events: httpAgent({
      method: 'GET',
      path: `${basePath}/contracts/{contractId}/events`
    })
  };

  return {contracts};
};

module.exports = contractResource;
