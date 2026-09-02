const CACHE_NAME = "lector-productos-v2";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        );
      })
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Para la página principal e index.html:
  // primero intenta descargar la versión nueva.
  if (
    request.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html")
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copia = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copia));

          return response;
        })
        .catch(() => caches.match(request))
    );

    return;
  }

  // Para el resto de archivos:
  // usar caché si existe, si no descargar.
  event.respondWith(
    caches.match(request)
      .then(response => {
        return response || fetch(request);
      })
  );
});
