import {test, expect} from '@playwright/test';

import {JSDOM} from 'jsdom';

import {getMaildevEmail} from './utils/get-maildev-email';
import {login} from './utils/login/login';
import {register} from './utils/register/register';

test.describe('Reset password', () => {
  test('should reset password', async ({page}) => {
    const user = await register(page);

    await page.goto('/login');

    await page.getByTestId('login-forgot-password').click();

    await expect(page).toHaveURL(/.*forgot-password/);
    await page.getByTestId('forgot-password-email-input').fill(user.email);
    await page.getByTestId('forgot-password-submit-button').click();

    await expect(page.getByText('Check your email')).toBeVisible();

    const resetPasswordEmail = await getMaildevEmail(user.email, {
      subject: 'Password Reset Request',
    });

    const dom = new JSDOM(resetPasswordEmail.html);
    const link = dom.window.document.querySelector('a');
    const hrefValue = link?.getAttribute('href');

    if (!hrefValue) {
      throw new Error('Reset password link not found in email');
    }

    const navigationPromise = page.waitForNavigation();
    await page.goto(hrefValue);
    await navigationPromise;

    await expect(page).toHaveURL(/.*reset-password/);

    const newPassword = 'NewStrongPassword123!';

    await page.getByTestId('reset-password-password-input').fill(newPassword);
    await page.getByTestId('reset-password-submit-button').click();

    await expect(page.getByText('Password reset successful!')).toBeVisible();

    // test login with old password
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

    // test login with new password
    await login(page, {
      email: user.email,
      password: newPassword,
    });
  });
});
