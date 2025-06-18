import {expect} from '@playwright/test';
import {login} from './utils/login/login.ts';
import {register} from './utils/register/register.ts';
import {test} from './utils/setup.ts';

test.describe('Login', () => {
  test('should decline login if password is wrong', async ({page}) => {
    const user = await register(page);

    await login(
      page,
      {
        email: user.email,
        password: 'wrongpassword',
      },
      {
        expectCredentialsError: true,
        use2Fa: false, // Skip 2FA since credentials will fail
      },
    );

    // Expect error message for invalid email or password
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('should login with valid credentials', async ({page}) => {
    const user = await register(page);

    await login(
      page,
      {
        email: user.email,
        password: user.password,
      },
      {
        use2Fa: false, // Stop after credentials validation
        skipSuccessAssertion: true,
      },
    );

    // Assert that we reached the 2FA step
    await expect(page.getByRole('heading', {name: 'Two-Factor Authentication'})).toBeVisible();
  });

  test('should decline login with invalid 2FA code', async ({page}) => {
    const user = await register(page);

    await login(
      page,
      {
        email: user.email,
        password: user.password,
      },
      {
        use2Fa: '123456', // Invalid 2FA code
        expectInvalid2Fa: true,
      },
    );

    // Expect error message for invalid 2FA code
    await expect(page.getByText('Invalid 2FA code. Please try again.')).toBeVisible();
  });

  test('should succeed login with valid 2FA code', async ({page}) => {
    const user = await register(page);

    await login(page, {
      email: user.email,
      password: user.password,
    }); // Default behavior: get 2FA from email and expect success

    // Success assertion is handled within login function by default
  });
});
