/* Generated at build time from src/sw-template.js — do not edit dist/sw.js by hand. */
const VERSION = '__VERSION__';
const CACHE = `wywtb-${VERSION}`;
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Pages: network first so content stays fresh, cache when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => (await caches.match(req, { ignoreSearch: true })) || caches.match('/404.html')),
    );
    return;
  }
  // Assets: cache first.
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
