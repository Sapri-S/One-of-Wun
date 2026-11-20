import { test, expect } from './fixtures';

test('roadmap toggle switches profile, light and explanation', async ({ page, problems }) => {
  await page.goto('/');
  const status = page.locator('#rm-status');
  await expect(status).toHaveAttribute('data-status', 'stop');
  await expect(page.locator('[aria-current="step"]')).toContainText('$1,000');

  await page.getByRole('button', { name: 'Ready', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ready', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(status).toHaveAttribute('data-status', 'go');
  await expect(page.locator('[data-explain]')).toContainText('green');
  await expect(page.locator('li.is-open')).toHaveCount(2);

  await page.getByRole('button', { name: /Pay off high-interest debt/ }).click();
  await expect(page.locator('[data-detail="4"]')).toBeVisible();
  expect(problems).toEqual([]);
});

const answer = async (page: import('@playwright/test').Page, name: string, v: 'yes' | 'no') =>
  page.locator(`input[name="${name}"][value="${v}"]`).check({ force: true });

test('readiness check: deterministic stop / wait / go and start over', async ({ page }) => {
  await page.goto('/');
  const box = page.locator('[data-result]');
  await expect(box).toHaveAttribute('data-state', 'pending');

  await answer(page, 'highInterestDebt', 'yes');
  await answer(page, 'hasThousandSaved', 'yes');
  await answer(page, 'billsCovered', 'yes');
  await expect(box).toHaveAttribute('data-state', 'stop');
  await expect(box).toContainText('Pay down debt over 15% APR');

  await answer(page, 'highInterestDebt', 'no');
  await answer(page, 'hasThousandSaved', 'no');
  await expect(box).toHaveAttribute('data-state', 'wait');

  await answer(page, 'hasThousandSaved', 'yes');
  await expect(box).toHaveAttribute('data-state', 'go');
  await expect(box.getByRole('link')).toHaveAttribute('href', '/learn');

  await answer(page, 'billsCovered', 'no');
  await expect(box).toHaveAttribute('data-state', 'stop');
  await expect(box).toContainText('Start with the basics');

  await box.getByRole('button', { name: 'Start over' }).click();
  await expect(box).toHaveAttribute('data-state', 'pending');
});

test('jargon term opens, closes with Escape and returns focus', async ({ page }) => {
  await page.goto('/');
  const term = page.locator('#roadmap button.term', { hasText: 'APR' });
  await term.click();
  const pop = page.getByRole('dialog', { name: 'APR' });
  await expect(pop).toBeVisible();
  await expect(pop).toContainText('$249');
  await page.keyboard.press('Escape');
  await expect(pop).toBeHidden();
  await expect(term).toBeFocused();
});

test('3-click rule: every main page linked from home', async ({ page }) => {
  await page.goto('/');
  for (const href of ['/grow', '/learn', '/practice', '/your-path', '/help']) {
    await expect(page.locator(`#start a[href="${href}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#start a[href="#readiness"]')).toHaveCount(1);
});

test('language switch keeps the same page', async ({ page }) => {
  await page.goto('/grow');
  await page.getByRole('link', { name: 'Ver esta página en español' }).click();
  await expect(page).toHaveURL(/\/es\/grow\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('h1')).toHaveText('Pasos pequeños, gran futuro');
});
