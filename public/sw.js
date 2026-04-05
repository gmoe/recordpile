const APP_SHELL_CACHE = 'app-shell-v1';
const COVER_IMAGE_CACHE = 'cover-images-v1';
const COVER_IMAGE_MAX = 200;

const APP_SHELL_URLS = ['/my-pile', '/'];
const STATIC_PREFIXES = ['/_next/static/'];
const COVER_IMAGE_PREFIX = '/api/cover-image/';
const NEVER_CACHE_PREFIXES = ['/api/auth/', '/api/pile-items/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) =>
      cache.addAll(APP_SHELL_URLS)
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== COVER_IMAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  // Never cache auth or mutation API requests
  if (NEVER_CACHE_PREFIXES.some((p) => path.startsWith(p))) return;

  // Cache-only for immutable static assets
  if (STATIC_PREFIXES.some((p) => path.startsWith(p))) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request))
    );
    return;
  }

  // Cache-first for cover images with bounded cache size
  if (path.startsWith(COVER_IMAGE_PREFIX)) {
    event.respondWith(
      caches.open(COVER_IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response.ok) {
            // Evict oldest entries if over the limit
            const keys = await cache.keys();
            if (keys.length >= COVER_IMAGE_MAX) {
              await cache.delete(keys[0]);
            }
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // Cache-first (app shell) for HTML navigation requests
  if (request.mode === 'navigate' || APP_SHELL_URLS.includes(path)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }
});
