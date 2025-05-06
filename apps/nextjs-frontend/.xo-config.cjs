module.exports = {
  space: true,
  prettier: true,
  ignores: ['node_modules', 'postcss.config.js', 'postcss.config.mjs', 'commitlint.config.js'],
  plugins: ['import'], // Plugins

  rules: {
    // Disabled for flexibility in naming -> "component.props.ts" instead of "component.properties.ts"
    'unicorn/prevent-abbreviations': 'off',

    // Disable console logs in frontend
    'no-console': ['error'],

    // Annoying
    '@typescript-eslint/capitalized-comments': 'off',
    'capitalized-comments': 'off',
    // Enforces return types
    '@typescript-eslint/explicit-function-return-type': 'error',
    // Avoids 'any' type
    '@typescript-eslint/no-explicit-any': 'error',
    // Disallows non-null assertions
    '@typescript-eslint/no-non-null-assertion': 'error',
    // Ensures import syntax is used
    '@typescript-eslint/no-var-requires': 'error',
    // Prevents unused variables
    '@typescript-eslint/no-unused-vars': 'error',

    // VSCode removes file extensions in imports
    'import/extensions': 'off',
    // VSCode removes file extensions in imports
    'n/file-extension-in-import': 'off',
    // Enforce consistent type imports
    '@typescript-eslint/consistent-type-imports': 'error',
    // Import order rules
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
