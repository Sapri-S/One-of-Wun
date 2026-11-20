import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/** The production CSP from netlify.toml, enforced on every test page (the preview server doesn't send it). */
const CSP = /Content-Security-Policy = "([^"]+)"/.exec(readFileSync('netlify.toml', 'utf8'))![1];

export const test = base.extend<{ problems: string[] }>({
  problems: async ({ page }, use) => {
    const problems: string[] = [];
    await page.route('**/*', async (route) => {
      const req = route.request();
      if (new URL(req.url()).origin !== 'http://localhost:4321') {
        problems.push(`outside request: ${req.url()}`);
        return route.abort();
      }
      if (req.resourceType() !== 'document') return route.continue();
      const res = await route.fetch();
      await route.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': CSP } });
    });
    page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
    page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
    await use(problems);
  },
});
export { expect };
