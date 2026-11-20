import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { mockApiResponse } from './mockApi';

/** The production CSP from netlify.toml, enforced on every test page (the preview server doesn't send it). */
const CSP = /Content-Security-Policy = "([^"]+)"/.exec(readFileSync('netlify.toml', 'utf8'))![1];

export const test = base.extend<{ problems: string[]; api: { off: boolean } }>({
  /**
   * Same-origin /api/* is served from fixed mock data on every test (the preview server can't run Vercel functions).
   * Set `api.off = true` to make it answer 503, like a missing key or a Finnhub outage.
   */
  api: [
    async ({ page }, use) => {
      const ctl = { off: false };
      await page.route(/^http:\/\/localhost:4321\/api\//, (route) => {
        const r = mockApiResponse(new URL(route.request().url()), ctl.off);
        return route.fulfill({ status: r.status, contentType: 'application/json', body: JSON.stringify(r.body) });
      });
      await use(ctl);
    },
    { auto: true },
  ],
  problems: async ({ page }, use) => {
    const problems: string[] = [];
    await page.route('**/*', async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin !== 'http://localhost:4321') {
        problems.push(`outside request: ${req.url()}`);
        return route.abort();
      }
      if (url.pathname.startsWith('/api/')) return route.fallback();
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
