/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@repo/eslint-config/server.js'],
  root: true,
  rules: {
    'import/no-cycle': 'off',
  },
};
