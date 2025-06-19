import {expect} from '@playwright/test';
import {login} from './utils/login/login.ts';
import {register} from './utils/register/register.ts';
import {test} from './utils/setup.ts';

test.describe('Logout', () => {
  test('should logout', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();

    await expect(page.getByText(`Hello, ${user.username}`)).toBeVisible();

    await page.getByText('Log Out').click();

    // Assert that we are redirected to the login page
    await expect(page).toHaveURL(/\/login/);

    await expect(page.getByTestId('header-login-button')).toBeVisible();
    await expect(page.getByTestId('header-user-menu-button')).not.toBeVisible();

    // Wait for any redirects to complete before navigating to profile
    await page.waitForLoadState('networkidle');

    await page.goto('/profile', {waitUntil: 'networkidle'});

    // Wait for redirect to login page
    await page.waitForURL(/\/login/, {timeout: 10_000});

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Error loading profile')).toBeVisible();
  });

  test('should logout using profile page logout button', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();

    await expect(page.getByText(`Hello, ${user.username}`)).toBeVisible();

    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    await page.getByTestId('profile-logout-button').click();

    // Wait for logout to complete and any redirects
    await page.waitForLoadState('networkidle');

    // Instead of immediately going to profile, wait a moment for logout to process
    await page.waitForTimeout(1000);

    try {
      await page.goto('/profile', {waitUntil: 'networkidle', timeout: 10_000});
    } catch {
      // If navigation fails due to redirect, that's expected
    }

    // Wait for redirect to login page
    await page.waitForURL(/\/login/, {timeout: 10_000});

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Error Loading Profile')).toBeVisible();
  });
});
