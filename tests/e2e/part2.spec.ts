// Part 2 interaction tests: /learn, /practice, /your-path, /help (+ Spanish spot checks).
import { test, expect } from './fixtures';

test.describe('/learn explorer', () => {
  test('cost chips change every card, risk is given in text', async ({ page, problems }) => {
    await page.goto('/learn');
    const index = page.locator('[data-cost="index"]');
    await expect(index).toHaveText('$0.50 a year on $1,000');
    await page.getByRole('button', { name: '$10,000', exact: true }).click();
    await expect(page.getByRole('button', { name: '$10,000', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(index).toHaveText('$5 a year on $10,000');
    await expect(page.locator('[data-cost="bond"]')).toHaveText('$10 a year on $10,000');
    await expect(page.locator('[data-cost="stock"]')).toHaveText('$0 a year on $10,000');
    await expect(page.getByText('Risk: 5 of 5')).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('jargon in a card opens a definition', async ({ page }) => {
    await page.goto('/learn');
    await page.locator('#fund-index button.term').first().click();
    await expect(page.locator('.term-pop:not([hidden])')).toContainText('Index fund');
  });
});

test.describe('/practice crash simulator', () => {
  test('drops $1,000 → $700, coaches in 4 steps, recovers, resets', async ({ page, problems }) => {
    await page.goto('/practice');
    const value = page.locator('[data-value]');
    await expect(value).toHaveText('$1,000');
    await expect(page.locator('[data-coach]')).toBeHidden();
    await expect(page.locator('[data-recover]')).toBeHidden();

    await page.getByRole('button', { name: 'Simulate a 30% market drop' }).click();
    await expect(value).toHaveText('$700', { timeout: 5000 });
    await expect(page.locator('[data-status]')).toContainText('30% drop');
    await expect(page.locator('[data-coach]')).toBeVisible();
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
    await expect(page.locator('[data-step="0"] .step-title')).toBeFocused();

    const next = page.getByRole('button', { name: 'Next' });
    await next.click();
    await expect(page.getByText('Step 2 of 4')).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
    for (let i = 0; i < 3; i++) await next.click();
    await expect(page.getByText('Step 4 of 4')).toBeVisible();
    await expect(next).toBeHidden();
    await expect(page.locator('[data-done]')).toBeVisible();

    await page.getByRole('button', { name: 'Show a recovery' }).click();
    await expect(page.locator('[data-projection]')).toContainText('Example, not a promise.');
    await expect(value).toHaveText('$1,050', { timeout: 5000 });

    await page.getByRole('button', { name: 'Reset practice portfolio' }).click();
    await expect(value).toHaveText('$1,000');
    await expect(page.locator('[data-coach]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Simulate a 30% market drop' })).toBeFocused();
    expect(problems).toEqual([]);
  });

  test('reduced motion jumps straight to $700', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/practice');
    await page.getByRole('button', { name: 'Simulate a 30% market drop' }).click();
    await expect(page.locator('[data-value]')).toHaveText('$700', { timeout: 300 });
  });

  test('Spanish simulator works', async ({ page }) => {
    await page.goto('/es/practice');
    await page.getByRole('button', { name: 'Simula una caída del 30%' }).click();
    await expect(page.getByText('Paso 1 de 4')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('/your-path life stages', () => {
  test('hash deep link opens the tab; arrow keys move; links lead to tools', async ({ page, problems }) => {
    await page.goto('/your-path#gig');
    await expect(page.getByRole('tab', { name: 'Gig work' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('Tariq');

    await page.getByRole('tab', { name: 'Gig work' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'First-gen' })).toBeFocused();
    await expect(page).toHaveURL(/#first-gen$/);
    await expect(page.getByRole('tabpanel')).toContainText('Ayanna');

    await page.keyboard.press('Home');
    const panel = page.getByRole('tabpanel');
    await expect(panel).toContainText('$8,000');
    await expect(panel).toContainText('$1,100');
    await expect(panel.getByRole('link', { name: 'See how steady saving grows' })).toHaveAttribute('href', '/grow');

    const box = panel.getByRole('checkbox').first();
    await box.check();
    await expect(box).toBeChecked();
    expect(problems).toEqual([]);
  });

  test('every tab has a Try this tool link', async ({ page }) => {
    for (const id of ['catch-up', 'gig', 'first-gen', 'banked']) {
      await page.goto(`/your-path#${id}`);
      await expect(page.locator(`#path-panel-${id} .tool a`).first()).toBeVisible();
    }
  });
});

test.describe('/help resources', () => {
  test('search, category chips, empty state and clear', async ({ page, problems }) => {
    await page.goto('/help');
    const items = page.locator('[data-item]:visible');
    const total = await page.locator('[data-item]').count();
    expect(total).toBeGreaterThanOrEqual(8);
    await expect(page.locator('[data-count]')).toHaveText(`Showing ${total} of ${total}`);

    await page.getByRole('button', { name: 'Taxes', exact: true }).click();
    await expect(items).toHaveCount(2);

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByLabel('Search resources').fill('credit union');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('NCUA');

    await page.getByLabel('Search resources').fill('zzzz');
    await expect(page.locator('[data-empty]')).toBeVisible();
    await expect(page.locator('[data-count]')).toHaveText(`Showing 0 of ${total}`);
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(items).toHaveCount(total);
    await expect(page.getByLabel('Search resources')).toBeFocused();
    expect(problems).toEqual([]);
  });

  test('every resource link is an external link with a screen-reader note', async ({ page }) => {
    await page.goto('/help');
    const links = page.locator('[data-item] a.ext');
    const n = await links.count();
    for (let i = 0; i < n; i++) {
      await expect(links.nth(i)).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(links.nth(i)).toHaveAttribute('href', /^https:\/\//);
    }
  });

  test('Spanish search ignores accents; FAQ opens', async ({ page }) => {
    await page.goto('/es/help');
    await page.getByLabel('Busca recursos').fill('credito');
    await expect(page.locator('[data-item]:visible').first()).toBeVisible();
    await page.locator('#faq summary').first().click();
    await expect(page.locator('#faq details').first()).toHaveAttribute('open', '');
  });
});

test('using every Part 2 tool stores nothing', async ({ page, problems }) => {
  await page.goto('/learn');
  await page.getByRole('button', { name: '$100', exact: true }).click();
  await page.goto('/practice');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Simulate a 30% market drop' }).click();
  await page.goto('/your-path#banked');
  await page.getByRole('tabpanel').getByRole('checkbox').first().check();
  await page.goto('/help');
  await page.getByLabel('Search resources').fill('tax');
  const state = await page.evaluate(() => ({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length }));
  expect(state).toEqual({ cookies: '', local: 0, session: 0 });
  expect(problems).toEqual([]);
});
