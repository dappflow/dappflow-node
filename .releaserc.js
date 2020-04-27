module.exports = {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ["@semantic-release/npm", {
      "npmPublish": true
    }],
    ["@semantic-release/github", {
      "publish": true
    }]
  ]
}