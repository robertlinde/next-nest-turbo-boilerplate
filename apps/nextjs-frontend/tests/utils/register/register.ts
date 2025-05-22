import {type Page, expect} from '@playwright/test';
import {JSDOM} from 'jsdom';

import {v4 as uuidv4} from 'uuid';

import {type MailDevEmail} from './types/mail-dev-mail.type';
import {type RegisterTestUserData} from './types/register-test-user-data.type';

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
  const emailInput = page.getByTestId('register-email');
  const usernameInput = page.getByTestId('register-username');
  const passwordInput = page.getByTestId('register-password');
  const submitButton = page.getByTestId('register-submit');

  await emailInput.fill(email);
  await usernameInput.fill(username);
  await passwordInput.fill(password);
  await submitButton.click();

  return {username, email, password};
};

// Get verification email
const getVerificationEmail = async (
  emailAddress: string,
  maxAttempts = 10,
  initialDelay = 500,
): Promise<MailDevEmail> => {
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const delay = initialDelay * 1.5 ** attempts;

    // eslint-disable-next-line no-await-in-loop
    const mailDevResponse = await fetch(`${process.env.NEXT_PUBLIC_MAILDEV_API_URL}/email`); // eslint-disable-line n/prefer-global/process
    if (!mailDevResponse.ok) {
      throw new Error(`Failed to fetch emails from MailDev: ${mailDevResponse.statusText}`);
    }

    // eslint-disable-next-line no-await-in-loop
    const emails = (await mailDevResponse.json()) as MailDevEmail[];
    const verificationEmail = emails.find((email) => email.headers.to === emailAddress);

    if (verificationEmail) {
      return verificationEmail;
    }

    if (attempts < maxAttempts - 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, delay);
      });
    }
  }

  throw new Error(`Verification email not found after ${maxAttempts} attempts`);
};

// Verify email by clicking the link in the email
const verifyEmail = async (page: Page, emailAddress: string): Promise<void> => {
  const verificationEmail = await getVerificationEmail(emailAddress);

  const dom = new JSDOM(verificationEmail.html);
  const link = dom.window.document.querySelector('a');
  const hrefValue = link?.getAttribute('href');

  if (!hrefValue) {
    throw new Error('Verification link not found in email');
  }

  const navigationPromise = page.waitForNavigation();
  await page.goto(hrefValue);
  await navigationPromise;
};

// Complete registration flow with option to skip verification
export const register = async (
  page: Page,
  options?: {
    registerUserData?: Partial<RegisterTestUserData>;
    skipEmailRegistrationConfirm?: boolean;
    expectSuccess?: boolean;
  },
): Promise<RegisterTestUserData> => {
  const {registerUserData, skipEmailRegistrationConfirm = false, expectSuccess = true} = options ?? {};

  // Fill the form and submit
  const userData = await fillRegisterForm(page, registerUserData);

  if (expectSuccess) {
    // Wait for successful registration message
    await expect(page.getByText('Registration successful!')).toBeVisible();

    if (!skipEmailRegistrationConfirm) {
      await verifyEmail(page, userData.email);
      await expect(page.getByText('Confirmation successful!')).toBeVisible();
    }
  }

  return userData;
};
