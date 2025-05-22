import {test, expect} from '@playwright/test';

import {register} from './utils/register/register';

test.describe('Register', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/register');
  });

  test('should decline registration when password is too weak', async ({page}) => {
    await register(page, {
      registerUserData: {
        email: 'test@test.de',
        username: 'testuser',
        password: 'weakpassword',
      },
      skipEmailRegistrationConfirm: true,
      expectSuccess: false,
    });

    await expect(page.getByText('Password is not strong enough')).toBeVisible();
  });

  test('should register user and send a verification email', async ({page}) => {
    await register(page);
    // All assertions are handled within register function
  });

  test('should decline registration with duplicate email', async ({page}) => {
    // First registration
    const {email} = await register(page, {skipEmailRegistrationConfirm: true, expectSuccess: true}); // Skip verification

    await register(page, {
      registerUserData: {
        email,
        username: `different-${Date.now().toString().slice(0, 8)}`,
      },
      skipEmailRegistrationConfirm: true,
      expectSuccess: false,
    });

    // Expect error message for duplicate email
    await expect(page.getByText('Email or username already exists')).toBeVisible();
  });

  test('should decline registration with duplicate username', async ({page}) => {
    // First registration
    const {username} = await register(page, {skipEmailRegistrationConfirm: true, expectSuccess: true});

    // Second registration with same username
    await page.goto('/register');
    await register(page, {
      registerUserData: {
        username,
        email: `different-${Date.now()}@playwright.test`,
      },
      skipEmailRegistrationConfirm: true,
      expectSuccess: false,
    });

    // Expect error message for duplicate username
    await expect(page.getByText('Email or username already exists')).toBeVisible();
  });
});
