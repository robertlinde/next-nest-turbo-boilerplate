module.exports = {
  space: true,
  prettier: true,
  ignores: ['node_modules', 'commitlint.config.js'],
  plugins: ['import'], // Plugins

  rules: {
    // Disabled for flexibility in naming -> "component.props.ts" instead of "component.properties.ts"
    'unicorn/prevent-abbreviations': 'off',

    // Does not work with decorators
    'new-cap': 'off',

    'no-warning-comments': 'error',

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
    // Annoying, makes it hard to adhere to coding standards
    'n/prefer-global/process': 'off',

    // VSCode removes file extensions in imports
    'import/extensions': 'off',
    // VSCode removes file extensions in imports
    'n/file-extension-in-import': 'off',
    // Open API doc fails to recognize type import of DTOs correctly
    '@typescript-eslint/consistent-type-imports': 'off',
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
    // Allow __dirname and __filename -> it is running commonjs so it is not a problem
    'unicorn/prefer-module': 'off',

    // Forbid mikro orm findOneOrFail -> it's better to use findOne and handle the error manually, else it will always throw an 500 error
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
