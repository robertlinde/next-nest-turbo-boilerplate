import {type FlatXoConfig} from 'xo';
// eslint-disable-next-line n/no-extraneous-import
import tseslint from 'typescript-eslint';
import {type ESLint, type Linter} from 'eslint';
import unicorn from 'eslint-plugin-unicorn';

const xoConfig: FlatXoConfig = [
  // Extend the base config by merging its properties with nestjs specific additions
  {
    ignores: ['node_modules', 'postcss.config.mjs', 'commitlint.config.js'],
  },
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin as ESLint.Plugin,
      unicorn,
    },
    languageOptions: {
      parser: tseslint.parser as Linter.Parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    react: true,
    prettier: 'compat',
    space: true,
    rules: {
      // Since Next.js is used this can be disabled
      'react/react-in-jsx-scope': 'off',

      // Disable console logs in frontend
      'no-console': ['error'],

      // Force exhaustive dependencies in useEffect hooks by default
      'react-hooks/exhaustive-deps': 'error',

      // Annoying
      '@typescript-eslint/capitalized-comments': 'off',
      'capitalized-comments': 'off',

      // Typescript rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-unused-vars': 'error',

      // Import rules
      'import-x/extensions': 'error',
      'n/file-extension-in-import': 'error',
    },
  },
];

export default xoConfig;
