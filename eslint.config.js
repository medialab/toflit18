module.exports = {
  extends: [
    '@yomguithereal/eslint-config/es7',
    '@yomguithereal/eslint-config/react'
  ].map(require.resolve),
  globals: {
    sigma: true
  }
};
