// @ts-check
import { defineConfig } from 'astro/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Writes dist/sw.js with a precache list of every built file.
 * Pages added later (Part 2) are picked up automatically — no edits needed.
 */
function serviceWorker() {
  return {
    name: 'wywtb-service-worker',
    hooks: {
      /** @param {{ dir: URL }} opts */
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        /** @type {string[]} */
        const files = [];
        /** @param {string} d */
        async function walk(d) {
          for (const entry of await readdir(d, { withFileTypes: true })) {
            const full = join(d, entry.name);
            if (entry.isDirectory()) await walk(full);
            else files.push(full);
          }
        }
        await walk(root);
        const hash = createHash('sha256');
        const urls = [];
        for (const f of files.sort()) {
          const rel = '/' + relative(root, f).split('\\').join('/');
          if (rel === '/sw.js' || rel.endsWith('.txt') || rel.startsWith('/_headers') || rel.startsWith('/_redirects')) continue;
          hash.update(rel).update(await readFile(f));
          urls.push(rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel);
        }
        const template = await readFile(new URL('./src/sw-template.js', import.meta.url), 'utf8');
        const out = template
          .replace('__VERSION__', hash.digest('hex').slice(0, 12))
          .replace('__PRECACHE__', JSON.stringify(urls));
        await writeFile(join(root, 'sw.js'), out);
      },
    },
  };
}

export default defineConfig({
  site: 'https://whereyouwanttobe.example',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // CSP forbids inline <style> and <script>; always emit files.
    inlineStylesheets: 'never',
    format: 'directory',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
  devToolbar: { enabled: false },
  integrations: [serviceWorker()],
});
