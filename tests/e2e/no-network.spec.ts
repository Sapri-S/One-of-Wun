import { test, expect } from './fixtures';
import { ROUTES } from './routes';

test('no outside requests, cookies or storage after using every tool', async ({ page, problems }) => {
  for (const route of ROUTES) await page.goto(route);

  await page.goto('/');
  await page.getByRole('button', { name: 'Ready', exact: true }).click();
  await page.locator('input[name="highInterestDebt"][value="no"]').check();
  await page.goto('/grow');
  await page.locator('#kz-weekly').fill('50');

  const state = await page.evaluate(() => ({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length }));
  expect(state).toEqual({ cookies: '', local: 0, session: 0 });
  expect(problems).toEqual([]);
});
