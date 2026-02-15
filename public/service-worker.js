const CACHE = 'undercover-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './manifest.json',
  './words.json',
  './github.svg',
  './icon.svg',
];

// 7 days in milliseconds
const EXPIRY = 7 * 24 * 60 * 60 * 1000;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {

    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null));
    self.clients.claim();
  })());
});

// Fetch with stale-while-revalidate and 10-day refresh
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cachedResponse = await cache.match(req);
    const now = Date.now();

    if (cachedResponse) {
      // Check timestamp
      const lastFetched = await cache.match(req.url + '?timestamp');
      if (lastFetched) {
        const lastTime = parseInt(await lastFetched.text(), 10);
        if (now - lastTime > EXPIRY) {
          // Fetch fresh if older than 7 days
          try {
            const networkResponse = await fetch(req);
            cache.put(req, networkResponse.clone());
            cache.put(req.url + '?timestamp', new Response(now.toString()));
            return networkResponse;
          } catch(e) {
            return cachedResponse; // fallback to cache
          }
        }
      }
      return cachedResponse;
    } else {
      try {
        const networkResponse = await fetch(req);
        cache.put(req, networkResponse.clone());
        cache.put(req.url + '?timestamp', new Response(now.toString()));
        return networkResponse;
      } catch(e) {
        return new Response('Offline', { status: 503 });
      }
    }
  })());
});
