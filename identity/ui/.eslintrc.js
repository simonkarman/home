module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    // File
    indent: ['error', 2],
    '@typescript-eslint/indent': 'off',
    semi: ['error', 'always'],
    'max-len': ['error', { code: 150, ignoreComments: true, tabWidth: 2 }],
    'eol-last': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 1 }],

    // Layout
    quotes: ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'no-trailing-spaces': 'error',
    'no-unexpected-multiline': 'error',
    'object-curly-spacing': ['error', 'always'],
    'key-spacing': 'error',
    'space-in-parens': 'error',
    'no-multi-spaces': 'error',
    'comma-spacing': 'error',
    'no-template-curly-in-string': 'off',
    camelcase: 'off',
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    // Code
    'no-use-before-define': ['error', { functions: false, classes: false, variables: true }],
    'no-unreachable': 'error',
    'no-new': 'off',
    'max-classes-per-file': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    '@typescript-eslint/no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    'import/prefer-default-export': 'off',

    // React
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-one-expression-per-line': ['error', { allow: 'literal' }],
    'jsx-quotes': ['error', 'prefer-single'],
  },
};
