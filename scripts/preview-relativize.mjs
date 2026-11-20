// Rewrites preview-dist/ so every link and asset path is relative (no server-side routing needed).
// Also writes home.html (Home with full document) and _page.html (Home body for an artifact page wrapper).
import { readdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = 'preview-dist';
const files = [];
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const f = join(d, e.name);
    if (e.isDirectory()) await walk(f); else files.push(f);
  }
}
await walk(root);

function target(p) {
  const [path, hash] = p.split('#');
  let out;
  if (path === '' || path === '/') out = 'home.html';
  else if (path === '/es' || path === '/es/') out = 'es.html';
  else {
    const clean = path.replace(/^\//, '').replace(/\/$/, '');
    out = /\.[a-z0-9]+$/i.test(clean) ? clean : `${clean}.html`;
  }
  return hash !== undefined ? `${out}#${hash}` : out;
}

await copyFile(join(root, 'index.html'), join(root, 'home.html'));
files.push(join(root, 'home.html'));

for (const f of files) {
  const rel = relative(root, f);
  const depth = rel.split('/').length - 1;
  const up = '../'.repeat(depth);
  if (f.endsWith('.html')) {
    let s = await readFile(f, 'utf8');
    s = s.replace(/(href|src)="(\/[^"/][^"]*|\/)"/g, (_, a, p) => `${a}="${up}${target(p)}"`);
    s = s.replace(/&quot;(\/[a-z\-/]*(?:#[a-z\-]+)?)&quot;/g, (_, p) => `&quot;${up}${target(p)}&quot;`);
    await writeFile(f, s);
  } else if (f.endsWith('.css')) {
    let s = await readFile(f, 'utf8');
    s = s.replace(/url\((['"]?)\/(fonts\/[^)'"]+)\1\)/g, (_, q, p) => `url(${q}../${p}${q})`);
    await writeFile(f, s);
  }
}

// Page body for an artifact wrapper: strip the document shell, keep head contents.
const home = await readFile(join(root, 'home.html'), 'utf8');
const page = home
  .replace(/<!doctype html>/i, '')
  .replace(/<html[^>]*>/i, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<body[^>]*>/i, '')
  .replace(/<\/body>\s*<\/html>\s*$/i, '');
await writeFile(join(root, '_page.html'), page);
console.log('relativized', files.length, 'files');
