const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  extends: [
    'turbo',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
  ],
  plugins: ['import', '@typescript-eslint'],
  rules: {
    //! turbo
    'turbo/no-undeclared-env-vars': 0,
    //! typescript
    '@typescript-eslint/no-redeclare': 0,
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-shadow': 0,
    '@typescript-eslint/naming-convention': 0,
    //! import
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    'import/order': 0,
    'import/no-extraneous-dependencies': 0,
    //! no
    'no-nested-ternary': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-return-assign': 0,
    'no-restricted-syntax': 0,
    'no-await-in-loop': 0,
    'no-console': 0,
    'no-plusplus': 0,
    //! others
    'comma-dangle': 0,
    camelcase: 0,
    'consistent-return': 0,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
};
