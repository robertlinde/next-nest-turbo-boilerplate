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

      'unicorn/filename-case': 'off',
    },
  },
];

export default xoConfig;
