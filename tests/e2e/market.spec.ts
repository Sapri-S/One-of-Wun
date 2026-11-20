// /invest mock market. /api/* is served from tests/e2e/mockApi.ts by the fixtures.
import { test, expect } from './fixtures';

const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

test.describe('/invest mock market', () => {
  test('shows real-looking prices, starts with $10,000 play money', async ({ page, problems }) => {
    await page.goto('/invest');
    await expect(page.locator('h1')).toHaveText('Mock market');
    await expect(page.locator('[data-out="total"]')).toHaveText(money(10000));
    await expect(page.locator('[data-out="cash"]')).toHaveText(money(10000));
    await expect(page.locator('[data-watch] li', { hasText: 'AAPL' })).toContainText('$200.00');
    await expect(page.locator('[data-price-status]')).toHaveAttribute('data-state', 'ok');
    expect(problems).toEqual([]);
  });

  test('search → buy by dollars → sell by shares → history, and it survives a reload', async ({ page, problems }) => {
    await page.goto('/invest');
    await page.getByLabel('Company name or ticker').fill('coca');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('button', { name: /KO/ }).click();
    await expect(page.locator('[data-q-symbol]')).toHaveText('KO');
    await expect(page.locator('[data-q-price]')).toHaveText('$60.00');

    await page.getByLabel('How many dollars?').fill('600');
    await expect(page.locator('[data-preview]')).toHaveText('Buy 10 shares of KO at $60.00 = $600.00');
    await page.getByRole('button', { name: 'Place play-money order' }).click();
    await expect(page.locator('[data-trade-msg]')).toContainText('You bought 10 shares of KO for $600.00');
    await expect(page.locator('[data-out="cash"]')).toHaveText(money(9400));
    await expect(page.locator('[data-holdings] tr', { hasText: 'KO' })).toContainText('10');

    await page.getByRole('button', { name: 'Sell', exact: true }).click();
    await page.getByRole('button', { name: 'Shares', exact: true }).click();
    await page.getByLabel('How many shares?').fill('4');
    await page.getByRole('button', { name: 'Place play-money order' }).click();
    await expect(page.locator('[data-out="cash"]')).toHaveText(money(9640));
    await expect(page.locator('[data-history] li')).toHaveCount(2);

    await page.reload();
    await expect(page.locator('[data-out="cash"]')).toHaveText(money(9640));
    await expect(page.locator('[data-holdings] tr', { hasText: 'KO' })).toContainText('6');
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toEqual(['wywtb.mockMarket.v1']);
    expect(problems).toEqual([]);
  });

  test("can't overspend or oversell", async ({ page }) => {
    await page.goto('/invest');
    await page.getByRole('button', { name: /^AAPL Apple/ }).click();
    await page.getByLabel('How many dollars?').fill('20000');
    await page.getByRole('button', { name: 'Place play-money order' }).click();
    await expect(page.locator('[data-trade-msg]')).toHaveText('Not enough play cash for that order.');
    await page.getByRole('button', { name: 'Sell', exact: true }).click();
    await page.getByLabel('How many dollars?').fill('10');
    await page.getByRole('button', { name: 'Place play-money order' }).click();
    await expect(page.locator('[data-trade-msg]')).toHaveText("You don't own that many shares of AAPL.");
    await expect(page.locator('[data-out="cash"]')).toHaveText(money(10000));
  });

  test('reset asks first, then starts over', async ({ page }) => {
    await page.goto('/invest');
    await page.getByRole('button', { name: /^MSFT Microsoft/ }).click();
    await page.getByLabel('How many dollars?').fill('800');
    await page.getByRole('button', { name: 'Place play-money order' }).click();
    await expect(page.locator('[data-out="cash"]')).toHaveText(money(9200));

    await page.getByRole('button', { name: 'Reset play money' }).click();
    await page.getByRole('button', { name: 'Keep my portfolio' }).click();
    await expect(page.locator('[data-out="cash"]')).toHaveText(money(9200));
    await page.getByRole('button', { name: 'Reset play money' }).click();
    await page.getByRole('button', { name: 'Yes, start over' }).click();
    await expect(page.locator('[data-out="cash"]')).toHaveText(money(10000));
    await expect(page.locator('[data-holdings-empty]')).toBeVisible();
  });

  test('watchlist add and remove', async ({ page }) => {
    await page.goto('/invest');
    await page.getByRole('button', { name: 'Remove TSLA from watchlist' }).click();
    await expect(page.locator('[data-watch]')).not.toContainText('TSLA');
    await page.getByLabel('Company name or ticker').fill('coca');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('button', { name: /KO/ }).click();
    await page.getByRole('button', { name: 'Add to watchlist' }).click();
    await expect(page.locator('[data-watch]')).toContainText('KO');
  });

  test('prices unavailable: calm message, trading paused', async ({ page, api }) => {
    api.off = true;
    await page.goto('/invest');
    await expect(page.locator('[data-price-status]')).toHaveAttribute('data-state', 'down');
    await expect(page.locator('[data-price-status]')).toContainText('Live prices are unavailable');
    await page.getByRole('button', { name: /^AAPL Apple/ }).click();
    await page.getByLabel('How many dollars?').fill('100');
    await expect(page.getByRole('button', { name: 'Place play-money order' })).toBeDisabled();
  });

  test('Spanish version works', async ({ page, problems }) => {
    await page.goto('/es/invest');
    await expect(page.locator('h1')).toHaveText('Mercado de práctica');
    await page.getByRole('button', { name: /^AAPL Apple/ }).click();
    await page.getByLabel('¿Cuántos dólares?').fill('400');
    await expect(page.locator('[data-preview]')).toContainText('Comprar 2 acciones de AAPL');
    expect(problems).toEqual([]);
  });
});
