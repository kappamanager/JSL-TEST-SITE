const CACHE_NAME = 'slt-20260329180501';
const PRECACHE = [
  './',
  './index.html',
  './favicon.ico',
  './manifest.json',
  './data/icon-192.png',
  './data/icon-512.png',
  './data/question/question_list.xlsx.enc',
  './data/comments.json.enc',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200) return resp;
        const url = e.request.url;
        const shouldCache =
          url.includes('/data/') ||
          url.includes('xlsx.full.min') ||
          url.endsWith('.html') ||
          url.endsWith('.json') ||
          url.endsWith('.enc') ||
          url.endsWith('.jpg') ||
          url.endsWith('.png') ||
          url.endsWith('.ico');
        if (shouldCache) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => {
        if (cached) return cached;
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
