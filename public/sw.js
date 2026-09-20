// Self-clearing service worker to flush legacy caches
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Always network-first, no stale asset trapping
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
