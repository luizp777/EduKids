const CACHE_NAME = 'edukids-cache-v4';
const CORE_ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];
const ESSENTIAL_AUDIO_PREFIXES = [
  '/audio/pt-br/lumi-',
  '/audio/pt-br/som-ligado.mp3',
  '/audio/pt-br/sticker-locked.mp3',
  '/audio/pt-br/cel-',
  '/audio/pt-br/enc-',
  '/audio/pt-br/p-',
];

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

  // Pre-cache only essential UI/praise/fixed prompt clips; question clips are cached on-demand via fetch
  fetch('/audio/pt-br/manifest.json')
    .then((res) => (res.ok ? res.json() : []))
    .then((urls) => {
      if (Array.isArray(urls) && urls.length > 0) {
        const essential = urls.filter(
          (u) =>
            !u.startsWith('/audio/pt-br/p-lang-') &&
            ESSENTIAL_AUDIO_PREFIXES.some((prefix) => u.startsWith(prefix))
        );
        precacheAudioInBatches(essential, 6);
      }
    })
    .catch(() => {});
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML navigations and manifests so new deployments appear immediately
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/audio/pt-br/manifest.json'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((hit) => hit || caches.match('/index.html'))
        )
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
