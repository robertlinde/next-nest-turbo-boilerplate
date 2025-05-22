import {test, expect} from '@playwright/test';

import {JSDOM} from 'jsdom';

import {getMaildevEmail} from './utils/get-maildev-email';
import {register} from './utils/register/register';

test.describe('Login', () => {
  test('should decline login if password is wrong', async ({page}) => {
    const user = await register(page);

    await page.goto('/login');

    const emailInput = page.getByTestId('login-email');
    const passwordInput = page.getByTestId('login-password');
    const submitButton = page.getByTestId('login-submit');

    await emailInput.fill(user.email);
    await passwordInput.fill('wrongpassword');
    await submitButton.click();

    // Expect error message for invalid email or password
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('should login with valid credentials', async ({page}) => {
    const user = await register(page);

    await page.goto('/login');

    const emailInput = page.getByTestId('login-email');
    const passwordInput = page.getByTestId('login-password');
    const submitButton = page.getByTestId('login-submit');

    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await submitButton.click();

    await expect(page.getByText('Please enter your 2FA code')).toBeVisible();
  });

  test('should decline login with invalid 2FA code', async ({page}) => {
    const user = await register(page);

    await page.goto('/login');

    const emailInput = page.getByTestId('login-email');
    const passwordInput = page.getByTestId('login-password');
    const submitButton = page.getByTestId('login-submit');

    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await submitButton.click();

    // Fill in the 2FA code
    const twoFaCodeInput = page.getByTestId('login-2fa');
    const twoFaSubmitButton = page.getByTestId('login-submit-2fa');

    await twoFaCodeInput.fill('123456');
    await twoFaSubmitButton.click();

    // Expect error message for invalid 2FA code
    await expect(page.getByText('Invalid two-factor authentication code or code expired')).toBeVisible();
  });

  test('should succeed login with valid 2FA code', async ({page}) => {
    const user = await register(page);

    await page.goto('/login');

    const emailInput = page.getByTestId('login-email');
    const passwordInput = page.getByTestId('login-password');
    const submitButton = page.getByTestId('login-submit');

    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await submitButton.click();

    // Fill in the 2FA code
    const twoFaCodeInput = page.getByTestId('login-2fa');
    const twoFaSubmitButton = page.getByTestId('login-submit-2fa');

    const email = await getMaildevEmail(user.email, {subject: 'Your 2FA Code'});

    const dom = new JSDOM(email.html);
    const twoFaCodeElement = dom.window.document.querySelector('strong');
    const twoFaCode = twoFaCodeElement?.textContent;

    if (!twoFaCode) {
      throw new Error('2FA code not found in email');
    }

    await twoFaCodeInput.fill(twoFaCode);
    await twoFaSubmitButton.click();

    await expect(page.getByText('Login successful')).toBeVisible();
  });
});
