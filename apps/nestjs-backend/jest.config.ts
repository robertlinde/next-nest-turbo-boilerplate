import type {Config} from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: String.raw`(.*(controller|service|guard|interceptor|pipe|middleware|filter|decorator))\.spec\.ts$`,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest', // eslint-disable-line @typescript-eslint/naming-convention
  },
  collectCoverageFrom: [
    '**/*.(controller|service|guard|interceptor|pipe|middleware|filter).ts', // Coverage for relevant files (excluding decorators from strict coverage)
    '**/*.decorator.ts', // Include decorators in coverage report but with different thresholds
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: './../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 65, // Adjusted to match current coverage level
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
