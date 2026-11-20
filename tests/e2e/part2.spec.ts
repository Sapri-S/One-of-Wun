import { test, expect } from './fixtures';

test('learn: amount chips update dollar costs; no tickers', async ({ page, problems }) => {
  await page.goto('/learn');
  await expect(page.getByText('How this works')).toBeVisible();
  const index = page.locator('.card').first();
  await expect(index.locator('[data-cost]')).toHaveText('$0.50');
  await expect(index).toContainText('Risk: 3 of 5');
  await page.getByRole('button', { name: '$10,000' }).click();
  await expect(page.getByRole('button', { name: '$10,000' })).toHaveAttribute('aria-pressed', 'true');
  await expect(index.locator('[data-cost]')).toHaveText('$5');
  await expect(page.locator('[data-fee-check]')).toContainText('$100');
  await expect(page.locator('.card').nth(1).locator('[data-cost]')).toHaveText('$0');
  expect(problems).toEqual([]);
});

test('practice: drop to $700, coaching steps, recovery, reset', async ({ page, problems }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/practice');
  const balance = page.locator('[data-balance]');
  await expect(balance).toHaveText('$1,000');
  await page.getByRole('button', { name: 'Simulate a 30% market drop' }).click();
  await expect(balance).toHaveText('$700');
  await expect(page.locator('[data-change]')).toContainText('30%');
  await expect(page.locator('[data-coach-progress]')).toHaveText('Step 1 of 4');
  await expect(page.getByRole('button', { name: 'Simulate a 30% market drop' })).toBeHidden();
  for (let i = 2; i <= 4; i++) {
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('[data-coach-progress]')).toHaveText(`Step ${i} of 4`);
  }
  await expect(page.getByRole('button', { name: 'Next' })).toBeHidden();
  await page.getByRole('button', { name: 'Show a possible recovery' }).click();
  await expect(balance).toHaveText('$1,050');
  await expect(page.locator('[data-recovery]')).toContainText('Example, not a promise.');
  await page.getByRole('button', { name: 'Reset practice account' }).click();
  await expect(balance).toHaveText('$1,000');
  await expect(page.getByRole('button', { name: 'Simulate a 30% market drop' })).toBeVisible();
  expect(problems).toEqual([]);
});

test('practice: animated drop also lands on $700', async ({ page }) => {
  await page.goto('/practice');
  await page.getByRole('button', { name: 'Simulate a 30% market drop' }).click();
  await expect(page.locator('[data-balance]')).toHaveText('$700', { timeout: 5000 });
});

test('your path: tabs by click, keyboard and hash', async ({ page, problems }) => {
  await page.goto('/your-path');
  await expect(page.getByRole('tab', { name: 'Age 50+ catch-up' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('$8,000');
  await expect(page.getByRole('tabpanel')).not.toContainText(/missed|behind|too late/i);
  await page.getByRole('tab', { name: 'Gig and variable pay' }).click();
  await expect(page).toHaveURL(/#gig$/);
  await expect(page.getByRole('tabpanel')).toContainText('Tariq');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'First-gen earner' })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Ayanna');

  await page.goto('/your-path#banked');
  await expect(page.getByRole('tab', { name: 'New to banking' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tabpanel').getByRole('link', { name: 'Find free banking help' }).click();
  await expect(page).toHaveURL(/\/help#banking$/);
  await expect(page.getByRole('button', { name: 'Banking', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-res]:not([hidden])')).toHaveCount(3);
  expect(problems).toEqual([]);
});

test('help: topic filter, search, empty state, FAQ', async ({ page, problems }) => {
  await page.goto('/help');
  const visible = page.locator('[data-res]:not([hidden])');
  const total = await visible.count();
  expect(total).toBeGreaterThanOrEqual(8);
  await page.getByRole('button', { name: 'Taxes', exact: true }).click();
  await expect(visible).toHaveCount(2);
  await page.getByRole('button', { name: 'All topics' }).click();
  await page.getByLabel('Search resources').fill('tax');
  await expect(visible.first()).toContainText(/tax/i);
  await page.getByLabel('Search resources').fill('zzzz');
  await expect(visible).toHaveCount(0);
  await expect(page.getByText('No resources match that search.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(visible).toHaveCount(total);
  await expect(page.getByLabel('Search resources')).toBeFocused();

  // Every outside link is a free public/nonprofit https link with no referrer.
  for (const a of await page.locator('a[data-external-org]').all()) {
    expect(await a.getAttribute('href')).toMatch(/^https:\/\//);
    expect(await a.getAttribute('rel')).toContain('noreferrer');
  }

  await page.getByText('Is this financial advice?').click();
  await expect(page.getByText('This site is education only')).toBeVisible();
  expect(problems).toEqual([]);
});

test('spanish versions of part 2 pages', async ({ page }) => {
  await page.goto('/es/learn');
  await expect(page.locator('h1')).toHaveText('Lo básico de invertir');
  await page.goto('/es/help');
  await page.getByLabel('Buscar recursos').fill('impuestos');
  await expect(page.locator('[data-res]:not([hidden])').first()).toBeVisible();
  await page.goto('/es/your-path#catch-up');
  await expect(page.getByRole('tabpanel')).toContainText('$8,000');
});
