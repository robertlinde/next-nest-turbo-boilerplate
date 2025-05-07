// Next.js specific XO config
module.exports = {
  extends: require.resolve('../../.xo-config.base.cjs'),

  space: true,
  prettier: true,
  ignores: ['node_modules', 'postcss.config.js', 'postcss.config.mjs', 'commitlint.config.js'],
  rules: {
    // Disable console logs in frontend
    'no-console': ['error'],

    // Next.js specific rule
    '@typescript-eslint/consistent-type-imports': 'error',
  },

  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        // Disabling this rule as filenames of React components are in PascalCase
        'unicorn/filename-case': 'off',
      },
    },
  ],
};
