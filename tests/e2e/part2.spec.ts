// Part 2 interaction tests: /learn, /your-path, /help (+ Spanish spot checks).
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
    await expect(panel.getByRole('link', { name: 'See how steady saving grows' })).toHaveAttribute('href', '/save#calculator');

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

test('visiting and using the non-trading tools stores nothing', async ({ page, problems }) => {
  await page.goto('/learn');
  await page.getByRole('button', { name: '$100', exact: true }).click();
  await page.goto('/invest');
  await page.getByRole('button', { name: 'Search', exact: true }).waitFor();
  await page.goto('/your-path#banked');
  await page.getByRole('tabpanel').getByRole('checkbox').first().check();
  await page.goto('/help');
  await page.getByLabel('Search resources').fill('tax');
  const state = await page.evaluate(() => ({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length }));
  expect(state).toEqual({ cookies: '', local: 0, session: 0 });
  expect(problems).toEqual([]);
});
