import {test, expect} from '@playwright/test';
import {JSDOM} from 'jsdom';
import {v4 as uuidv4} from 'uuid';

type MailDevEmail = {
  headers: {
    to: string;
    subject: string;
  };
  html: string;
}

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
    
    await expect(page.getByText('Registration successful!')).toBeVisible();

    // Function to poll for the verification email with exponential backoff
    const getVerificationEmail = async (maxAttempts = 10, initialDelay = 500): Promise<MailDevEmail> => {
      let attempts = 0;
      let delay = initialDelay;
      
      while (attempts < maxAttempts) {
        const mailDevResponse = await fetch(`${process.env.NEXT_PUBLIC_MAILDEV_API_URL}/email`);
        const emails = (await mailDevResponse.json()) as MailDevEmail[];
        const verificationEmail = emails.find((email) => email.headers.to === emailAddress);
        
        if (verificationEmail) {
          return verificationEmail;
        }
        
        attempts++;
        await new Promise<void>(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
      
      throw new Error(`Verification email not found after ${maxAttempts} attempts`);
    };

    const verificationEmail = await getVerificationEmail();
    expect(verificationEmail).toBeDefined();

    const dom = new JSDOM(verificationEmail.html);
    const link = dom.window.document.querySelector('a');
    const hrefValue = link?.getAttribute('href');

    if (!hrefValue) {
      throw new Error('Verification link not found in email');
    }

    const navigationPromise = page.waitForNavigation();
    await page.goto(hrefValue);
    await navigationPromise;

    await expect(page.getByText('Confirmation successful!')).toBeVisible();
  });

  test('should decline registration with duplicate email', async ({page}) => {
    // Generate unique username but use the same email for both attempts
    const username1 = uuidv4().slice(0, 8);
    const username2 = uuidv4().slice(0, 8);
    const emailAddress = `duplicate-test@playwright.test`;
    const password = 'StrongPassword123!';
    
    const emailInput = page.getByTestId('register-email');
    const usernameInput = page.getByTestId('register-username');
    const passwordInput = page.getByTestId('register-password');
    const submitButton = page.getByTestId('register-submit');

    // First registration
    await emailInput.fill(emailAddress);
    await usernameInput.fill(username1);
    await passwordInput.fill(password);
    await submitButton.click();
    
    await expect(page.getByText('Registration successful!')).toBeVisible();
    
    // Navigate back to registration page
    await page.goto('/register');
    
    // Second registration with same email
    await emailInput.fill(emailAddress);
    await usernameInput.fill(username2);
    await passwordInput.fill(password);
    await submitButton.click();
    
    // Expect error message for duplicate email
    await expect(page.getByText('Email or username already exists')).toBeVisible();
  });

  test('should decline registration with duplicate username', async ({page}) => {
    // Generate unique email but use the same username for both attempts
    const username = `duplicate-user-${uuidv4().slice(0, 6)}`;
    const emailAddress1 = `${uuidv4().slice(0, 8)}@playwright.test`;
    const emailAddress2 = `${uuidv4().slice(0, 8)}@playwright.test`;
    const password = 'StrongPassword123!';
    
    const emailInput = page.getByTestId('register-email');
    const usernameInput = page.getByTestId('register-username');
    const passwordInput = page.getByTestId('register-password');
    const submitButton = page.getByTestId('register-submit');

    // First registration
    await emailInput.fill(emailAddress1);
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await submitButton.click();
    
    await expect(page.getByText('Registration successful!')).toBeVisible();
    
    // Navigate back to registration page
    await page.goto('/register');
    
    // Second registration with same username
    await emailInput.fill(emailAddress2);
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await submitButton.click();
    
    // Expect error message for duplicate username
    await expect(page.getByText('Email or username already exists')).toBeVisible();
  });
});
