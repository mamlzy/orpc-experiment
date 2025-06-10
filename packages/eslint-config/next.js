const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  extends: [
    'plugin:turbo/recommended',
    'next',
    'airbnb',
    'airbnb-typescript',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    //! turbo
    'turbo/no-undeclared-env-vars': 0,
    //! typescript
    '@typescript-eslint/no-shadow': 0,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/no-unused-expressions': 0,
    // '@typescript-eslint/no-implied-eval': 0,
    // '@typescript-eslint/no-throw-literal': 0,
    // '@typescript-eslint/return-await': 0,
    // '@typescript-eslint/dot-notation': 0,
    // '@typescript-eslint/no-shadow': 0,
    //! react
    'react/no-children-prop': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-props-no-spreading': 0,
    'react/prop-types': 0,
    'react/require-default-props': 0,
    'react/no-array-index-key': 0,
    'react/no-unstable-nested-components': 0,
    'react/no-unescaped-entities': 0,
    'react/function-component-definition': [
      'error',
      {
        namedComponents: ['function-declaration', 'arrow-function'],
        unnamedComponents: 'arrow-function',
      },
    ],
    //! react-hooks
    'react-hooks/rules-of-hooks': 0,
    'react-hooks/exhaustive-deps': 0,
    //! jsx-a11y
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    //! import
    'import/order': 0,
    // 'import/extensions': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    //! no
    'no-console': 0,
    'no-nested-ternary': 0,
    'no-plusplus': 0,
    'no-restricted-syntax': 0,
  },
  // settings: {
  //   'import/resolver': {
  //     typescript: {
  //       project,
  //     },
  //   },
  // },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.cjs',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 0,
      },
    },
  ],
};
