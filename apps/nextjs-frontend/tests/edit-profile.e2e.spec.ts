import {test, expect} from '@playwright/test';

import {login} from './utils/login/login';
import {register} from './utils/register/register';

test.describe('Edit profile', () => {
  test('should change username', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    const newUsername = `new-${Date.now().toString().slice(0, 8)}`;

    await page.getByTestId('profile-username-input').fill(newUsername);
    await page.getByTestId('profile-save-button').click();

    await page.getByText('Yes').click();

    // Assert that the username has been changed
    await expect(page.getByText('Profile update successful')).toBeVisible();
    await expect(page.getByText(`Hey, ${newUsername}`)).toBeVisible();
  });

  test('should change email', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    const newEmail = `new-${Date.now().toString().slice(0, 8)}@playwright.test`;

    await page.getByTestId('profile-email-input').fill(newEmail);
    await page.getByTestId('profile-save-button').click();

    await page.getByText('Yes').click();

    await page.getByTestId('profile-logout-button').click();

    await login(page, {
      email: newEmail,
      password: user.password,
    });
  });
});
