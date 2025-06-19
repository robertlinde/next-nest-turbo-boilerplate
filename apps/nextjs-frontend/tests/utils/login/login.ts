import {type Page, expect} from '@playwright/test';
import {JSDOM} from 'jsdom';
import {getMaildevEmail} from '../get-maildev-email.ts';
import {type LoginCredentials} from './types/login-credentials.type.ts';

// Function to fill the login form - no assertions
const fillLoginForm = async (page: Page, credentials: LoginCredentials): Promise<void> => {
  // Wait for any redirects to complete before navigating
  await page.waitForLoadState('networkidle');

  // Use waitForURL to handle potential redirects
  await page.goto('/login', {waitUntil: 'networkidle'});

  // Wait for the login form to be visible before interacting
  await page.waitForSelector('[data-testid="login-email"]', {state: 'visible'});

  const emailInput = page.getByTestId('login-email');
  const passwordInput = page.getByTestId('login-password');
  const submitButton = page.getByTestId('login-submit');

  await emailInput.fill(credentials.email);
  await passwordInput.fill(credentials.password);
  await submitButton.click();
};

// Function to handle 2FA step
const handle2Fa = async (page: Page, twoFaCode: string): Promise<void> => {
  // Wait for 2FA form to be visible
  await page.waitForSelector('[data-testid="login-2fa"]', {state: 'visible'});

  const twoFaCodeInput = page.getByTestId('login-2fa');
  const twoFaSubmitButton = page.getByTestId('login-submit-2fa');

  await twoFaCodeInput.fill(twoFaCode);
  await twoFaSubmitButton.click();
};

// Function to get 2FA code from email
const get2FaCodeFromEmail = async (email: string): Promise<string> => {
  const emailContent = await getMaildevEmail(email, {subject: 'Your 2FA Code'});

  const dom = new JSDOM(emailContent.html);
  const twoFaCodeElement = dom.window.document.querySelector('strong');
  const twoFaCode = twoFaCodeElement?.textContent;

  if (!twoFaCode) {
    throw new Error('2FA code not found in email');
  }

  return twoFaCode;
};

// Complete login flow with various options
export const login = async (
  page: Page,
  credentials: LoginCredentials,
  options?: {
    expectCredentialsError?: boolean;
    expectInvalid2Fa?: boolean;
    use2Fa?: string | boolean; // String for specific code, true to get from email, false to skip
    skipSuccessAssertion?: boolean;
  },
): Promise<void> => {
  const {
    expectCredentialsError = false,
    expectInvalid2Fa = false,
    use2Fa = true,
    skipSuccessAssertion = false,
  } = options ?? {};

  // Fill and submit login form
  await fillLoginForm(page, credentials);

  if (expectCredentialsError) {
    // Don't proceed with 2FA if credentials are expected to fail
    return;
  }

  // Wait for either 2FA prompt or error message
  try {
    await expect(page.getByRole('heading', {name: 'Two-Factor Authentication'})).toBeVisible({timeout: 10_000});
  } catch (error) {
    // If 2FA prompt doesn't appear, check if we're already logged in or have an error
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw error; // Re-throw if we're still on login page
    }

    return; // Already logged in, exit early
  }

  // Wait for 2FA prompt (assuming successful credential validation)
  if (use2Fa !== false) {
    const twoFaCode = typeof use2Fa === 'string' ? use2Fa : await get2FaCodeFromEmail(credentials.email);

    await handle2Fa(page, twoFaCode);

    if (!expectInvalid2Fa && !skipSuccessAssertion) {
      await expect(page.getByText('Login Successful')).toBeVisible();
    }
  }
};
