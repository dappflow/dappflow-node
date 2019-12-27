const {serial} = require('ava');
const sinon = require('sinon');
const {createSpyAgent} = require('../utils');
const {createResourcesRoot} = require('../../resource');
const tokenResources = require('../../resources/Token');

serial('tokens.createAndSign should call the agent with the correct parameters ', async t => {
  const createTokenResponse = {rawTx: 123, tokenAddress: '0x123'};
  const updateTokenResponse = {tokenAddress: '0x123'};
  const stub = sinon
    .stub()
    .onCall(0)
    .returns(createTokenResponse)
    .onCall(1)
    .returns(updateTokenResponse);

  const spyAgent = createSpyAgent(stub);
  const builtResources = createResourcesRoot([tokenResources])(spyAgent);

  const testBody = {test: true};
  await builtResources.tokens.createAndSign(testBody, a => a);

  const {body: firstBody} = spyAgent.getArgs(0);
  const {body: secondBody} = spyAgent.getArgs(1);

  t.deepEqual(firstBody, testBody);
  t.deepEqual(secondBody, createTokenResponse);
});
