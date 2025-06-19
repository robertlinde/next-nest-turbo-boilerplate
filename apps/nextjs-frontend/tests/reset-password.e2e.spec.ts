import {expect} from '@playwright/test';
import {JSDOM} from 'jsdom';
import {getMaildevEmail} from './utils/get-maildev-email.ts';
import {login} from './utils/login/login.ts';
import {register} from './utils/register/register.ts';
import {test} from './utils/setup.ts';

test.describe('Reset password', () => {
  test('should reset password', async ({page}) => {
    const user = await register(page);

    await page.goto('/login');

    await page.getByTestId('login-forgot-password').click();

    await expect(page).toHaveURL(/.*forgot-password/);
    await page.getByTestId('forgot-password-email-input').fill(user.email);
    await page.getByTestId('forgot-password-submit-button').click();

    await expect(page.getByText('Please check your inbox.')).toBeVisible();

    const resetPasswordEmail = await getMaildevEmail(user.email, {
      subject: 'Reset Your Password',
    });

    const dom = new JSDOM(resetPasswordEmail.html);
    const link = dom.window.document.querySelector('a');
    const hrefValue = link?.getAttribute('href');

    if (!hrefValue) {
      throw new Error('Reset password link not found in email');
    }

    // Navigate to the reset password link
    await page.goto(hrefValue);

    // Wait for navigation to complete and check if we're on a reset password page
    // This handles the localization redirect automatically
    await page.waitForLoadState('networkidle');

    // Additional check: wait for URL to contain 'reset-password' to ensure we're on the right page
    await page.waitForURL((url) => url.pathname.includes('reset-password'), {
      timeout: 5000, // Short timeout since navigation should already be complete
    });

    await expect(page).toHaveURL(/.*reset-password/);

    const newPassword = 'NewStrongPassword123!';

    await page.getByTestId('reset-password-password-input').fill(newPassword);
    await page.getByTestId('reset-password-submit-button').click();

    await expect(page.getByText('Password Set Successfully')).toBeVisible();

    // Test login with old password
    await login(
      page,
      {
        email: user.email,
        password: user.password,
      },
      {
        expectCredentialsError: true,
      },
    );

    // Test login with new password
    await login(page, {
      email: user.email,
      password: newPassword,
    });
  });
});
