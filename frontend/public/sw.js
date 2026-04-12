const CACHE_NAME = 'bulkio-v1';
const STATIC_ASSETS = [
   '/',
   '/manifest.json',
];

self.addEventListener('install', (event) => {
   event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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
});

self.addEventListener('fetch', (event) => {
   const { request } = event;
   const url = new URL(request.url);

   // Skip non-GET and API requests
   if (request.method !== 'GET' || url.pathname.startsWith('/api')) {
      return;
   }

   event.respondWith(
      // Network-first for navigation, cache-first for static assets
      url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/)
         ? caches.match(request).then((cached) =>
            cached || fetch(request).then((response) => {
               const clone = response.clone();
               caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
               return response;
            })
         )
         : fetch(request)
            .then((response) => {
               const clone = response.clone();
               caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
               return response;
            })
            .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
   );
});
