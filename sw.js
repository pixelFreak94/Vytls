// sw.js — offline copy and safe auto-update (DEV_PLAN §3).
//
// How an update reaches the phone:
// 1. Each release changes VERSION (keep it in step with js/app.js).
// 2. The phone notices sw.js changed, and downloads the WHOLE new version into a new cache.
//    If any file fails, the install fails and the old version keeps running untouched.
// 3. The new version waits. The app tells it to take over only at a safe moment
//    (app hidden or just opened, no movement count running, nothing being typed).
// 4. The page reloads once onto the new version. Readings live in localStorage, which
//    this file never touches; store.js upgrades their shape if needed.

const VERSION = '0.4.0';
const CACHE = `vytls-${VERSION}`;

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/tokens.css', 'css/base.css', 'css/components.css', 'css/motion.css', 'css/counter.css', 'css/alerts.css', 'css/history.css', 'css/report.css',
  'js/app.js', 'js/store.js', 'js/atmosphere.js', 'js/entry.js', 'js/audio.js',
  'js/settings.js', 'js/today.js', 'js/kicks.js', 'js/alerts.js', 'js/history.js', 'js/report.js',
  'fonts/sora-vf-latin.woff2', 'fonts/manrope-vf-latin.woff2', 'fonts/jetbrains-mono-vf-latin.woff2', 'fonts/bebas-neue-latin-400.woff2',
  'icons/apple-touch-icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' skips the browser's own HTTP cache, so every file is truly the new one.
  e.waitUntil(caches.open(CACHE).then((c) =>
    c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('vytls-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'take-over') self.skipWaiting();
  if (e.data === 'version') e.source?.postMessage({ version: VERSION });
});

// Cache first, from this version's cache only, so files from two versions never mix.
// Anything not cached yet is fetched once and kept.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const hit = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  })());
});
