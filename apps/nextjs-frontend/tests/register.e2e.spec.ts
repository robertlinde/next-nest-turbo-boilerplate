import {test, expect} from '@playwright/test';
import {JSDOM} from 'jsdom';
import {v4 as uuidv4} from 'uuid';

test.describe('Register', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/register');
  });

  test('should decline registration when password is too weak', async ({page}) => {
    const emailInput = page.getByTestId('register-email');
    const usernameInput = page.getByTestId('register-username');
    const passwordInput = page.getByTestId('register-password');
    const submitButton = page.getByTestId('register-submit');

    const invalidEmail = 'test@test.de';
    const username = 'testuser';
    const password = 'weakpassword';

    await emailInput.fill(invalidEmail);
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await submitButton.click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Password is not strong enough')).toBeVisible();
  });

  test('should register user and send a verification email', async ({page}) => {
    const emailInput = page.getByTestId('register-email');
    const usernameInput = page.getByTestId('register-username');
    const passwordInput = page.getByTestId('register-password');
    const submitButton = page.getByTestId('register-submit');

    const username = uuidv4().slice(0, 8);
    const emailAddress = `${username}@playwright.test`;
    const password = 'StrongPassword123!';
    await emailInput.fill(emailAddress);
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await submitButton.click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Registration successful!')).toBeVisible();

    const mailDevResponse = await fetch(`${process.env.NEXT_PUBLIC_MAILDEV_API_URL}/email`); // eslint-disable-line n/prefer-global/process
    const emails = (await mailDevResponse.json()) as Array<{headers: {to: string; subject: string}; html: string}>;
    const verificationEmail = emails.find((email) => email.headers.to === emailAdress);
    expect(verificationEmail).toBeDefined();

    if (!verificationEmail) {
      throw new Error('Verification email not found');
    }

    // Use JSDOM to parse HTML
    const dom = new JSDOM(verificationEmail.html);
    const link = dom.window.document.querySelector('a');
    const hrefValue = link?.getAttribute('href');

    if (!hrefValue) {
      throw new Error('Verification link not found in email');
    }

    await page.goto(hrefValue);
    await page.waitForTimeout(2000);

    await expect(page.getByText('Confirmation successful!')).toBeVisible();
  });
});
