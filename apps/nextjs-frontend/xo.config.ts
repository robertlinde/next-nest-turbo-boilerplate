import {type FlatXoConfig} from 'xo';
import baseConfig from '../../xo.config.base';

const xoConfig: FlatXoConfig = [
  // Extend the base config by merging its properties with nestjs specific additions
  {
    ...baseConfig, // Spread all base config properties
    ignores: [
      ...(baseConfig.ignores || []), // Keep existing ignores from base
      'node_modules',
      'postcss.config.js',
      'postcss.config.mjs',
      'commitlint.config.js',
    ],
    react: true,
    rules: {
      ...baseConfig.rules, // Keep all base rules
      // Add/override Next.js specific rules
      // Disable console logs in frontend
      'no-console': ['error'],

      // Next.js specific rule
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // File-specific overrides
  {
    files: ['**/*.tsx'],
    rules: {
      // Disabling this rule as filenames of React components are in PascalCase
      'unicorn/filename-case': 'off',
    },
  },
];

export default xoConfig;
