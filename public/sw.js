const CACHE_NAME = 'edukids-cache-v2';
const CORE_ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

async function precacheAudioInBatches(urls, batchSize = 6) {
  try {
    const cache = await caches.open(CACHE_NAME);
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (url) => {
          const hit = await cache.match(url);
          if (!hit) {
            await cache.add(url);
          }
        })
      );
    }
  } catch {
    // Ignore offline/network errors during background pre-caching
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();

  // Pre-cache neural audio clips in small batches without blocking activation
  fetch('/audio/pt-br/manifest.json')
    .then((res) => (res.ok ? res.json() : []))
    .then((urls) => {
      if (Array.isArray(urls) && urls.length > 0) {
        precacheAudioInBatches(urls, 6);
      }
    })
    .catch(() => {});
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML navigations so new deployments appear immediately
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
