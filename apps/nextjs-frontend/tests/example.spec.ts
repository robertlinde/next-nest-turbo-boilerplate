import {test, expect} from '@playwright/test';

test('has title', async ({page}) => {
  await page.goto('/');

  const response = await fetch('http://localhost:1080/email');
  const emails = await response.json(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  console.log(emails); // eslint-disable-line no-console

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Next.js Frontend/);
});

test('get started link', async ({page}) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('link', {name: 'Login'}).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', {name: 'Welcome back!'})).toBeVisible();
});
