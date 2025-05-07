// Nest.js specific XO config
module.exports = {
  extends: require.resolve('../../.xo-config.base.cjs'),
  space: true,
  prettier: true,
  ignores: ['node_modules', 'commitlint.config.js'],
  rules: {
    // Does not work with decorators
    'new-cap': 'off',

    'no-warning-comments': 'error',

    // Nest.js specific rules
    '@typescript-eslint/consistent-type-imports': 'off', // Open API doc fails to recognize type import of DTOs correctly
    'n/prefer-global/process': 'off',

    // Allow __dirname and __filename -> it is running commonjs so it is not a problem
    'unicorn/prefer-module': 'off',

    // Forbid mikro orm findOneOrFail -> it's better to use findOne and handle the error manually
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.property.name='findOneOrFail']",
        message:
          "Avoid using 'findOneOrFail' as it will always throw an internal server error on fail. Use 'findOne' with manual error handling instead.",
      },
    ],
  },

  overrides: [
    {
      files: 'src/migrations/**/*', // Disables to follow mikro orm conventions for file names
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
    {
      files: '**/*.entity.ts', // Disables to follow mikro orm conventions for relations
      rules: {
        'import/no-cycle': 'off',
      },
    },
  ],
};
