import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';
import { ROUTES } from './routes';

for (const route of ROUTES) {
  test(`a11y + CSP + layout: ${route}`, async ({ page, problems }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
    expect(summary).toEqual([]);

    // Hard rule #2: every section carries a safety badge.
    const sections = await page.locator('main section.section').count();
    const badged = await page.locator('main section.section .badge').count();
    expect(badged).toBeGreaterThanOrEqual(sections);

    // No horizontal page scroll.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    expect(problems).toEqual([]);
  });
}

test('no horizontal scroll at 320px on any page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const route of ROUTES) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(0);
  }
});
