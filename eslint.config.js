module.exports = {
  extends: [
    '@yomguithereal/eslint-config/es7',
    '@yomguithereal/eslint-config/react'
  ].map(require.resolve),
  globals: {
    sigma: true
  },
  rules: {
    'react/jsx-indent-props': 0,
    'react/jsx-closing-bracket-location': 0
  }
};
