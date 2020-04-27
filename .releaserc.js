module.exports = {
  branches: ['fix-web3-changes'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm'
  ]
}