/* Nabra service worker: caches the app shell and libraries so the app opens
   offline. The language model itself is cached separately by WebLLM. */

const VERSION = 'nabra-shell-1.4.0';
const SHELL = [
  './',
  './index.html',
  './app.js',
  './core.js',
  './docx.js',
  './xlsx.js',
  './ocr.js',
  './llm-worker.js',
  './manifest.webmanifest',
  './privacy.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './vendor/web-llm.js',
  './vendor/jszip.min.js',
  './vendor/pdf.min.mjs',
  './vendor/pdf.worker.min.mjs',
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const FONT_CACHE = 'nabra-fonts';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      // Only this app's own shell caches; WebLLM keeps the model in caches named "webllm/…".
      keys.filter((k) => k.startsWith('nabra-shell-') && k !== VERSION).map((k) => caches.delete(k)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }
  // Model files (Hugging Face, GitHub) are cached by WebLLM itself; leave them alone.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    }),
  );
});

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  }).catch(() => null);
  return hit || (await network) || Response.error();
}
