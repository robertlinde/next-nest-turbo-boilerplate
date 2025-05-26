import {XoConfigItem} from 'xo';

const xoConfig: XoConfigItem = {
  prettier: 'compat',
  space: true,
  rules: {
    // Disabled for flexibility in naming -> "component.props.ts" instead of "component.properties.ts"
    'unicorn/prevent-abbreviations': 'off',

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
    'import/extensions': 'off',
    'n/file-extension-in-import': 'off',
    'import/order': [
      'error',
      {
        'newlines-between': 'always-and-inside-groups',
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        alphabetize: {
          order: 'asc', // Sort in ascending order
          caseInsensitive: true, // Ignore case when sorting
        },
      },
    ],
  },
};

export default xoConfig;
