const {serial} = require('ava');
const lodashSize = require('lodash.size');
const {ignoreProps, noop} = require('@coincierge/common/fn');
const {createSpyAgent} = require('./utils');
const {createResourcesRoot, createResources} = require('../resource');
const resources = require('../resources');
const testResources = require('./resources');

serial('createResourcesRoot should build all the resources correctly', t => {
  const builtResources = createResources(noop);

  const importedResourcesCount = resources
    .reduce((counter, currentResource) => {
      const currentCount = lodashSize(ignoreProps(['resourcePath'])(currentResource));

      return currentCount + counter;
    }, 0);

  const builtResourcesCount = Object
    .entries(builtResources)
    .reduce((counter, [_, resources]) => counter + lodashSize(resources), 0);

  t.is(builtResourcesCount, importedResourcesCount);
});

serial('requests that miss a needed parameter will fail', async t => {
  try {
    const newSpy = createSpyAgent();
    const builtResources = createResourcesRoot(testResources)(newSpy);

    await builtResources.test.fetch(); // no {id}
  }
  catch(error) {
    t.pass();
  }
});

serial('if POST requests have a single parameter, it is body', t => {
  const spyAgent = createSpyAgent();
  const builtResources = createResourcesRoot(testResources)(spyAgent);

  const requestBody = {name: 'name'};
  builtResources.test.create(requestBody);

  const {body} = spyAgent.getArgs();
  t.deepEqual(body, requestBody);
});

serial('if POST requests have more than one parameter, it is [body, query]', t => {
  const spyAgent = createSpyAgent();
  const builtResources = createResourcesRoot(testResources)(spyAgent);

  const requestBody = {name: 'name'};
  const requestQuery = {serverPosition: 'US'};
  builtResources.test.create(requestBody, requestQuery);

  const {body, query} = spyAgent.getArgs();
  t.deepEqual(body, requestBody);
  t.deepEqual(query, requestQuery);
});

serial('if PUT/PATCH requests do not have both body and parameters, it should throw an error', async t => {
  try {
    const spyAgent = createSpyAgent();
    const builtResources = createResourcesRoot(testResources)(spyAgent);

    const requestQuery = {tokenAddress: '0x123'};
    builtResources.test.update(requestQuery);
  }
  catch(error) {
    t.pass();
  }
});

serial('if PUT/PATCH requests have both body and parameters, it should call the resource correctly', async t => {
  const spyAgent = createSpyAgent();
  const builtResources = createResourcesRoot(testResources)(spyAgent);

  const requestQuery = {tokenAddress: '0x123'};
  const requestBody = {name: 'name'};
  builtResources.test.update(requestBody, requestQuery);

  const {body, url} = spyAgent.getArgs();

  t.deepEqual(body, requestBody);
  t.deepEqual(url.pathname, '/test/0x123');
});

serial('GET requests should ignore body', t => {
  const newSpy = createSpyAgent();
  const builtResources = createResourcesRoot(testResources)(newSpy);

  builtResources.test.fetch({id: 123}, {body: true});

  const {body} = newSpy.getArgs();

  t.is(body, undefined);
});

serial('DELETE requests should ignore body', t => {
  const newSpy = createSpyAgent();
  const builtResources = createResourcesRoot(testResources)(newSpy);

  builtResources.test.del({id: 123}, {body: true});

  const {body} = newSpy.getArgs();

  t.is(body, undefined);
});

serial('GET requests should pass the correct query parameters', t => {
  const newSpy = createSpyAgent();
  const builtResources = createResourcesRoot(testResources)(newSpy);

  builtResources.test.fetch({id: 123, query: 'abc'}, {body: true});

  const {query} = newSpy.getArgs();

  t.deepEqual(query, {query: 'abc'});
});
