// eslint-disable-next-line n/no-extraneous-import
import {type FlatXoConfig} from 'xo';
// eslint-disable-next-line n/no-extraneous-import
import tseslint from 'typescript-eslint';
// eslint-disable-next-line n/no-extraneous-import, import-x/no-extraneous-dependencies
import {ESLint, Linter} from 'eslint';

const xoConfig: FlatXoConfig = [
  // Extend the base config by merging its properties with nestjs specific additions
  {
    ignores: ['node_modules', 'commitlint.config.js'],
    prettier: 'compat',
    space: true,
    plugins: {
      '@typescript-eslint': tseslint.plugin as ESLint.Plugin,
    },
    languageOptions: {
      parser: tseslint.parser as Linter.Parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    rules: {
      // Disabled for flexibility in naming -> "component.props.ts" instead of "component.properties.ts"
      'unicorn/prevent-abbreviations': 'error',

      // Does not work with decorators
      'new-cap': 'off',

      'no-warning-comments': 'error',

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
