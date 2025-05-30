import {type FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
  {
    ignores: ['node_modules', 'postcss.config.mjs', 'commitlint.config.js'],
  },
  {
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
      'unicorn/prevent-abbreviations': 'off',

      // Typescript rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-unused-vars': 'error',

      // Code rules
      'max-params': 'error',

      // Import rules
      'import-x/extensions': 'error',
      'n/file-extension-in-import': 'error',
    },
  },
];

export default xoConfig;
