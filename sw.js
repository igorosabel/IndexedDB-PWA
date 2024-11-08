const CACHE_NAME = "pwa-cache-v3";
const ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/favicon.ico",
  "/sw.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/screenshot-mobile.png",
  "/icons/screenshot-wide.png",
];

// Instalar el Service Worker y cachear los archivos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar el Service Worker y limpiar cache antiguo
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Interceptar las solicitudes y servir desde el cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
