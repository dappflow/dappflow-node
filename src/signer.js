const ethers = require('ethers');

const isMnemonin = words => words.split(' ').length > 1;

const signer = privKey => {
  try {
    if(!privKey || typeof privKey !== 'string') {
      throw Error('To use the default signer you must pass a valid privKey string. Both hex or mnemonic versions are accepted.');
    }
    const wallet = isMnemonin(privKey)
      ? ethers.Wallet.fromMnemonic(privKey)
      : new ethers.Wallet(privKey);

    return wallet.sign;
  }
  catch(error) {
    throw Error(`Impossible initialise default signer: ${error.message}`);
  }
};

module.exports = {
  signer
};
