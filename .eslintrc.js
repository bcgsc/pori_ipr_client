module.exports = {
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react/function-component-definition': 'off',
    'import/extensions': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'import/prefer-default-export': 'warn',
    'max-len': 'off',
    'no-param-reassign': 'warn',
    'no-underscore-dangle': ['warn', { allow: ['_env_'] }],
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    'prefer-destructuring': ['error', { object: true, array: true }],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    {
      // Build/test tooling that tsconfig.json deliberately does not include.
      // Type-aware linting needs the file to be in the project, so these are
      // linted with the type-checked rules (and parserOptions.project) off.
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      files: ['./*.js', './config/jest/**/*.js'],
      env: {
        jest: true,
        node: true,
      },
      rules: {
        // These files are CommonJS by necessity: webpack and jest load them outside the app's module pipeline
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-extraneous-dependencies': 'off',
        // Setup files legitimately declare several small mock classes
        'max-classes-per-file': 'off',
      },
    },
  ],
};
