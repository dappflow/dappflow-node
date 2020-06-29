module.exports = {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/npm', {
      'npmPublish': true
    }],
    ['@semantic-release/github', {
      'publish': true
    }],
    ['@semantic-release/git', {
      'assets': ['CHANGELOG.md', 'package.json'],
      'message': 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
    }],
    ['@semantic-release/changelog', {
      'changelogFile': 'CHANGELOG.md',
    }]
  ]
}