import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig, devices} from '@playwright/test';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-disable-next-line n/prefer-global/process
if (!process.env.CI) {
  dotenv.config({path: resolve(__dirname, '.env')});
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  // Explicitly ignore backend Jest test files
  testIgnore: [
    '**/apps/nestjs-backend/**/*.spec',
    '**/apps/backend/**/*.spec',
    '**/*.unit.spec',
    '**/*.service.spec',
    '**/*.controller.spec',
  ],

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env.CI), // eslint-disable-line n/prefer-global/process
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0, // eslint-disable-line n/prefer-global/process
  /* Opt out of parallel tests on to prevent flaky tests. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000/en', // eslint-disable-line @typescript-eslint/naming-convention

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },

    // {
    //   name: 'webkit',
    //   use: {...devices['Desktop Safari']},
    // },

    // /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: {...devices['Pixel 5']},
    },
    // {
    //   name: 'Mobile Safari',
    //   use: {...devices['iPhone 15']},
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {...devices['Desktop Edge'], channel: 'msedge'},
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {...devices['Desktop Chrome'], channel: 'chrome'},
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start:dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // eslint-disable-line n/prefer-global/process
  },
});
