import {test, expect} from '@playwright/test';

import {login} from './utils/login/login';
import {register} from './utils/register/register';

test.describe('Logout', () => {
  test('should logout', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();

    await expect(page.getByText(`Hey, ${user.username}`)).toBeVisible();

    await page.getByText('Logout').click();

    // Assert that we are redirected to the login page
    await expect(page).toHaveURL(/\/login/);

    await expect(page.getByTestId('header-login-button')).toBeVisible();
    await expect(page.getByTestId('header-user-menu-button')).not.toBeVisible();

    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Error loading profile')).toBeVisible();
  });
});
