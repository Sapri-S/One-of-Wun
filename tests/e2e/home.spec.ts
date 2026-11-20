import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

test('home asks one question and offers the main tasks', async ({ page, problems }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2, name: 'What would you like to do today?' })).toBeVisible();
  const tasks = page.locator('.tasks a');
  await expect(tasks).toHaveCount(4);
  await expect(tasks.first()).toHaveAttribute('href', '/next-step');
  // Everything else is one click away (3-click rule).
  for (const href of ['/grow', '/learn', '/help', '/practice', '/your-path']) {
    await expect(page.locator(`.hero a[href="${href}"]`)).toHaveCount(1);
  }
  expect(problems).toEqual([]);
});

test('example roadmap toggle switches profile, light and explanation', async ({ page, problems }) => {
  await page.goto('/');
  const status = page.locator('#roadmap .status');
  await expect(status).toHaveAttribute('data-status', 'stop');
  await expect(page.locator('#roadmap [aria-current="step"]')).toContainText('$1,000');

  await page.getByRole('button', { name: 'Ready', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ready', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(status).toHaveAttribute('data-status', 'go');
  await expect(page.locator('[data-explain]')).toContainText('green');
  await expect(page.locator('#roadmap li.is-open')).toHaveCount(2);

  await page.getByRole('button', { name: /Pay off high-interest debt/ }).click();
  await expect(page.locator('#roadmap [data-detail="4"]')).toBeVisible();
  expect(problems).toEqual([]);
});

const answer = (page: Page, v: 'yes' | 'no') => page.locator(`[data-q]:not([hidden]) button[data-answer="${v}"]`).click();

test('guided check: one question at a time, back, result, path placement, start over', async ({ page, problems }) => {
  await page.goto('/next-step');
  await expect(page.locator('[data-progress]')).toHaveText('Question 1 of 3');
  await expect(page.locator('[data-q]:not([hidden])')).toHaveCount(1);
  await expect(page.locator('[data-placement]')).toBeHidden();

  await answer(page, 'yes'); // debt
  await expect(page.locator('[data-progress]')).toHaveText('Question 2 of 3');
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.locator('[data-progress]')).toHaveText('Question 1 of 3');
  await expect(page.locator('[data-q="0"] button[data-answer="yes"]')).toHaveAttribute('aria-pressed', 'true');
  await answer(page, 'yes');
  await answer(page, 'yes'); // $1,000 saved
  await answer(page, 'yes'); // bills covered

  const result = page.locator('[data-result]');
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute('data-state', 'stop');
  await expect(result).toContainText('Pay down debt over 15% APR');
  await expect(page.locator('[data-next-title]')).toHaveText('5. Pay off high-interest debt');
  await expect(page.locator('[data-result-title]')).toBeFocused();

  await expect(page.locator('[data-placement]')).toBeVisible();
  await expect(page.locator('#your-place [aria-current="step"]')).toContainText('high-interest debt');
  await expect(page.locator('#your-place li.is-gated')).toHaveCount(2);

  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.locator('[data-progress]')).toHaveText('Question 1 of 3');
  await expect(page.locator('[data-placement]')).toBeHidden();

  await answer(page, 'no');
  await answer(page, 'yes');
  await answer(page, 'yes');
  await expect(result).toHaveAttribute('data-state', 'go');
  await expect(result.getByRole('link', { name: 'Learn investing basics' })).toHaveAttribute('href', '/learn');
  await expect(page.locator('#your-place li.is-open')).toHaveCount(2);

  await page.getByRole('button', { name: 'Start over' }).click();
  await answer(page, 'no');
  await answer(page, 'no');
  await answer(page, 'yes');
  await expect(result).toHaveAttribute('data-state', 'wait');

  await page.getByRole('button', { name: 'Start over' }).click();
  await answer(page, 'no');
  await answer(page, 'yes');
  await answer(page, 'no');
  await expect(result).toContainText('Start with the basics');
  await expect(page.locator('[data-next-title]')).toHaveText('1. Cover the basics');
  expect(problems).toEqual([]);
});

test('jargon term opens, closes with Escape and returns focus', async ({ page }) => {
  await page.goto('/next-step');
  const term = page.locator('[data-q="0"] button.term');
  await term.click();
  const pop = page.getByRole('dialog', { name: 'APR' });
  await expect(pop).toBeVisible();
  await expect(pop).toContainText('$249');
  await page.keyboard.press('Escape');
  await expect(pop).toBeHidden();
  await expect(term).toBeFocused();
});

test('every tool page explains how it works', async ({ page }) => {
  for (const r of ['/next-step', '/grow']) {
    await page.goto(r);
    await expect(page.getByText('How this works')).toBeVisible();
  }
});

test('language switch keeps the same page', async ({ page }) => {
  await page.goto('/grow');
  await page.getByRole('link', { name: 'Ver esta página en español' }).click();
  await expect(page).toHaveURL(/\/es\/grow\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('h1')).toHaveText('Calculadora de ahorro');
});
