// /save: demo bank, high-yield savings, calculator, and the old-URL redirects.
import { test, expect } from './fixtures';

const toNum = (s: string | null) => Number((s ?? '').replace(/[^0-9.-]/g, ''));

test.describe('/save', () => {
  test('connect a demo bank: balances and transactions stay in range', async ({ page, problems }) => {
    await page.goto('/save');
    await expect(page.locator('[data-connected]')).toBeHidden();
    await page.getByLabel('Riverside Demo Credit Union').check();
    await page.getByRole('button', { name: 'Connect demo bank' }).click();
    await expect(page.locator('[data-bank-name]')).toHaveText('Connected to Riverside Demo Credit Union (demo)');

    const balances = await page.locator('.acct-bal').allTextContents();
    const [checking, savings] = balances.map(toNum);
    expect(checking).toBeGreaterThanOrEqual(400);
    expect(checking).toBeLessThanOrEqual(4500);
    expect(savings).toBeGreaterThanOrEqual(0);
    expect(savings).toBeLessThanOrEqual(3000);
    expect(await page.locator('[data-tx] li').count()).toBe(8);
    await page.getByRole('button', { name: /Show all/ }).click();
    expect(await page.locator('[data-tx] li').count()).toBeGreaterThan(8);
    await expect(page.locator('[data-bars] li').first()).toBeVisible();

    // High-yield picks up the demo savings balance.
    await expect(page.locator('#hys-balance')).toHaveValue(String(savings));
    expect(problems).toEqual([]);
  });

  test('move money to high-yield, then regenerate and disconnect', async ({ page }) => {
    await page.goto('/save');
    await page.getByRole('button', { name: 'Connect demo bank' }).click();
    const checking = toNum(await page.locator('.acct-bal').first().textContent());

    await page.getByLabel('Amount').fill('100000');
    await page.getByRole('button', { name: 'Move to high-yield' }).click();
    await expect(page.locator('[data-move-msg]')).toHaveText("There isn't that much in that account.");

    await page.getByLabel('Amount').fill('100');
    await page.getByRole('button', { name: 'Move to high-yield' }).click();
    await expect(page.locator('[data-move-msg]')).toContainText('Moved $100.00 from checking');
    await expect(page.locator('.acct--hys .acct-bal')).toHaveText('$100.00');
    expect(toNum(await page.locator('.acct-bal').first().textContent())).toBeCloseTo(checking - 100, 2);

    await page.getByRole('button', { name: 'New random data' }).click();
    await expect(page.locator('.acct--hys')).toHaveCount(0);
    await page.getByRole('button', { name: 'Disconnect' }).click();
    await expect(page.getByRole('button', { name: 'Connect demo bank' })).toBeVisible();
  });

  test('high-yield math updates with the rate slider', async ({ page }) => {
    await page.goto('/save');
    await page.locator('#hys-balance').fill('10000');
    await page.locator('#hys-current').fill('0');
    const firstRow = page.locator('[data-rows] tr').first();
    await expect(firstRow.locator('td').nth(1)).toHaveText('$400.00'); // 4% of $10,000 after 1 year
    await page.locator('#hys-rate').fill('5');
    await expect(firstRow.locator('td').nth(1)).toHaveText('$500.00');
    await expect(page.locator('#high-yield').getByText('Example, not a promise.')).toBeVisible();
  });

  test('calculator still works here and its input card no longer follows the scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/save#calculator');
    await expect(page.locator('[data-out="fv-0.06"]')).toHaveText('$20,555');
    const position = await page.locator('.kaizen .inputs').evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe('static');
  });

  test('old URLs redirect', async ({ page }) => {
    await page.goto('/grow');
    await expect(page).toHaveURL(/\/save\/?#calculator$/);
    await page.goto('/practice');
    await expect(page).toHaveURL(/\/invest\/?$/);
    await page.goto('/es/practice');
    await expect(page).toHaveURL(/\/es\/invest\/?$/);
  });
});
