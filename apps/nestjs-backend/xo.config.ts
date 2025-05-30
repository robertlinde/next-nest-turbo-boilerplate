// Since NestJS does not support ES modules yet, we need to use CommonJS modules. And since this is part of a turborepo, the xo package is installed at the root of the monorepo, so we can't access it here.

// import {type FlatXoConfig} from 'xo';

// const xoConfig: FlatXoConfig = [

const xoConfig = [
  // Extend the base config by merging its properties with nestjs specific additions
  {
    ignores: ['node_modules', 'commitlint.config.js'],
    prettier: 'compat',
    space: true,
    rules: {
      // Disabled for flexibility in naming -> "component.props.ts" instead of "component.properties.ts"
      'unicorn/prevent-abbreviations': 'off',

      // Does not work with decorators
      'new-cap': 'off',

      // Code rules
      'max-params': 'error',

      // Annoying
      '@typescript-eslint/capitalized-comments': 'off',
      'capitalized-comments': 'off',

      // Typescript rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-unused-vars': 'error',

      // Nest.js specific rules
      '@typescript-eslint/consistent-type-imports': 'off', // Open API doc fails to recognize type import of DTOs correctly
      'n/prefer-global/process': 'off',

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
  // Disables to follow mikro orm conventions for file names
  {
    files: ['src/migrations/**/*'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  // Disables to follow mikro orm conventions for relations
  {
    files: ['**/*.entity.ts'],
    rules: {
      'import/no-cycle': 'off',
    },
  },
];

export default xoConfig;
