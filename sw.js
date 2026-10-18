// Sandooq El-Amara - Lightweight Service Worker (PWA & Instant Asset Cache)
const CACHE_NAME = 'sandooq-v1-assets';
const STATIC_ASSETS = [
  '/',
  '/styles.css',
  '/script.js',
  '/assets/fonts/cairo-arabic.woff2',
  '/assets/fonts/cairo-latin.woff2',
  '/assets/sandooq-logo.png',
  '/assets/sandooq-logo.webp',
  '/favicon.ico',
  '/site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.debug('ServiceWorker cache addAll optional note:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1. Static resources (fonts, css, icons): Cache First, fallback to Network
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 2. HTML navigation requests: Network First, fallback to Cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match(req).then((cached) => {
          return cached || caches.match('/');
        });
      })
    );
  }
});
