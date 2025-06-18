import {type Page, expect} from '@playwright/test';
import {JSDOM} from 'jsdom';
import {v4 as uuidv4} from 'uuid';
import {getMaildevEmail} from '../get-maildev-email.ts';
import {type RegisterTestUserData} from './types/register-test-user-data.type.ts';

// Function to just fill the registration form - no assertions
const fillRegisterForm = async (
  page: Page,
  registerUserData?: Partial<RegisterTestUserData>,
): Promise<RegisterTestUserData> => {
  await page.goto('/register');

  // Generate default values if not provided
  const username = registerUserData?.username ?? uuidv4().slice(0, 8);
  const email = registerUserData?.email ?? `${username}@playwright.test`;
  const password = registerUserData?.password ?? 'StrongPassword123!';

  // Fill the form
  const emailInput = page.getByTestId('register-email-input');
  const usernameInput = page.getByTestId('register-username-input');
  const passwordInput = page.getByTestId('register-password-input');
  const submitButton = page.getByTestId('register-submit-button');

  await emailInput.fill(email);
  await usernameInput.fill(username);
  await passwordInput.fill(password);
  await submitButton.click();

  return {username, email, password};
};

// Verify email by clicking the link in the email
const verifyEmail = async (page: Page, emailAddress: string): Promise<void> => {
  const verificationEmail = await getMaildevEmail(emailAddress);

  const dom = new JSDOM(verificationEmail.html);
  const link = dom.window.document.querySelector('a');
  const hrefValue = link?.getAttribute('href');

  if (!hrefValue) {
    throw new Error('Verification link not found in email');
  }

  // Navigate to the verification link
  await page.goto(hrefValue);

  // Wait for navigation to complete and check if we're on a confirmation page
  // This handles the localization redirect automatically
  await page.waitForLoadState('networkidle');

  // Additional check: wait for URL to contain 'confirm' to ensure we're on the right page
  await page.waitForURL((url) => url.pathname.includes('confirm'), {
    timeout: 5000, // Short timeout since navigation should already be complete
  });
};

// Complete registration flow with option to skip verification
export const register = async (
  page: Page,
  options?: {
    registerUserData?: Partial<RegisterTestUserData>;
    skipEmailRegistrationConfirm?: boolean;
    expectCredentialsError?: boolean;
  },
): Promise<RegisterTestUserData> => {
  const {registerUserData, skipEmailRegistrationConfirm = false, expectCredentialsError = false} = options ?? {};

  // Fill the form and submit
  const userData = await fillRegisterForm(page, registerUserData);

  if (!expectCredentialsError) {
    // Wait for successful registration message
    await expect(page.getByText('Registration successful!')).toBeVisible();

    if (!skipEmailRegistrationConfirm) {
      await verifyEmail(page, userData.email);
      await expect(page.getByText('Your account has been successfully confirmed.')).toBeVisible();
    }
  }

  return userData;
};
