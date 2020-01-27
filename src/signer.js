const ethers = require('ethers');

const isMnemonin = words => words.split(' ').length > 1;

const signer = privKey => {
  const wallet = isMnemonin(privKey)
    ? ethers.Wallet.fromMnemonic(privKey)
    : new ethers.Wallet(privKey);

  return wallet.sign;
};

module.exports = {
  signer
};
