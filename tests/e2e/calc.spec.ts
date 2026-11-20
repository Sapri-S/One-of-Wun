import { test, expect } from './fixtures';

test('calculator defaults, steppers, slider and generations', async ({ page, problems }) => {
  await page.goto('/grow');
  await expect(page.locator('[data-out="fv-0.06"]')).toHaveText('$20,555');
  await expect(page.locator('[data-out="put"]')).toHaveText('$7,800');

  await page.getByRole('button', { name: 'More: How much each week?' }).click();
  await expect(page.locator('[data-out="weekly"]')).toHaveText('$10');
  await expect(page.locator('#kz-weekly')).toHaveAttribute('aria-valuetext', '$10 a week');

  // Keyboard on the slider.
  await page.locator('#kz-years').focus();
  await page.keyboard.press('End');
  await expect(page.locator('[data-out="years"]')).toHaveText('60');

  // Minimum clamps.
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Less: How much each week?' }).click();
  await expect(page.locator('[data-out="weekly"]')).toHaveText('$5');

  await page.getByRole('button', { name: '8%', exact: true }).click();
  await expect(page.getByRole('button', { name: '8%', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const you = await page.locator('[data-out="gen-you"]').textContent();
  expect(you).toBe(await page.locator('[data-out="fv-0.08"]').textContent());

  await expect(page.getByText('Example, not a promise.').first()).toBeVisible();
  expect(problems).toEqual([]);
});
