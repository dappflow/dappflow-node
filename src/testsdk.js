const {signTransaction} = require('@coincierge/eth-utils/core/v1/tx');
const {init} = require('./coincierge');

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.ETHEREUM_NETWORK = 'kovan';

const PRIV_KEY = '80D71AA58D06582D8AF8CFA58BA053D76AB0158E9E9FD58BF0BA7292C3233F4A';
const signer = ({
  nonce, to, value, data, gasLimit, gasPrice
}) => signTransaction(PRIV_KEY, nonce, to, value, data, gasLimit, gasPrice);

const main = async () => {
  const coincierge = await init(
    {
      clientSecret: 'de9e42d8696186df8c38df04342fdb4ffac867e138c3f41f4fbb5524f04518b3',
      clientId: 'sdk-be20bb40-ecc5-4acd-a38d-c5be98466703',
      privKey: PRIV_KEY
    },
    signer
  );
  const params = {
    templateName: 'CNG1400',
    params: {
      owner: '0xF7b547f3E46EFfB3480EEE2c486AE760734B135c',
      name: 'tokens2s3',
      symbol: 'tsd3',
      decimals: '18'
    }
  };
  const apps = await coincierge.apps.create({orgId: '90d79ad5-5f43-46f5-908b-14037e3a6172', ...params});
//   const apps = await coincierge.apps.list();
//   const appId = apps[0].id;
//   const {contracts} = await coincierge.contracts.list({appId});
//   const {id: contractId} = contracts.find(c => c.interface === 'CNG1400');
//   const cng1400 = await coincierge.contracts.retrieveInstance({
//     appId,
//     contractId
//   });
//   const name = await cng1400.name();
//   console.log(name);
//   const issueResult = await cng1400.issue(
//     {
//       account: '0xdE00A350e6927C2177e469511c90A61eDD801890',
//       value: 10,
//       data: '0x0'
//     },
//     '0xF7b547f3E46EFfB3480EEE2c486AE760734B135c'
//   );
//   console.log(issueResult);
};

main();
