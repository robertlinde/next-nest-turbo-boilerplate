import {type FlatXoConfig} from 'xo';
import baseConfig from '../../xo.config.base';

const xoConfig: FlatXoConfig = [
  // Extend the base config by merging its properties with nestjs specific additions
  {
    ...baseConfig, // Spread all base config properties
    ignores: [
      ...(baseConfig.ignores || []), // Keep existing ignores from base
      'node_modules',
      'commitlint.config.js',
    ],
    rules: {
      ...baseConfig.rules, // Keep all base rules
      // Add/override Nest.js specific rules
      'new-cap': 'off', // Does not work with decorators
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
  },

  // File-specific overrides
  {
    files: ['src/migrations/**/*'], // Disables to follow mikro orm conventions for file names
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['**/*.entity.ts'], // Disables to follow mikro orm conventions for relations
    rules: {
      'import/no-cycle': 'off',
    },
  },
];

export default xoConfig;
