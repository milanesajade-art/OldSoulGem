const CACHE_NAME = 'vida-shell-v7';
const APP_SHELL = [
  './',
  './index.html',
  './product.html',
  './thanks.html',
  './offline.html',
  './styles.css',
  './production.css',
  './pwa.css',
  './collection-data.js',
  './site-data.js',
  './app.js',
  './product.js',
  './pwa.js',
  './favicon.svg',
  './app-icon.svg',
  './assets/floral-opal-ring.svg',
  './assets/orbit-opal-ring.svg',
  './assets/braided-gold-band.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request, {ignoreSearch: request.mode === 'navigate'});
      if (cached) return cached;
      if (request.mode === 'navigate') return cache.match('./offline.html');
      return Response.error();
    }
  })());
});