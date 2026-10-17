const CACHE_NAME = "lector-productos-v7";

/* Recursos propios que precargamos al instalar el service worker. */
const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./banner-cruz-verde.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./vendor/zxing-browser.min.js"
];

/*
  Hosts que NO deben cachearse:
  - La API de Google Sheets (respuesta dinámica): cachearla serviría
    datos viejos al pulsar "Actualizar productos".
*/
const HOSTS_SIN_CACHE = [
  "script.google.com",
  "googleusercontent.com"
];

function esPeticionNavegacion(request, url) {
  return (
    request.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html")
  );
}

function estaExcluido(url) {
  return HOSTS_SIN_CACHE.some(
    host => url.hostname === host || url.hostname.endsWith("." + host)
  );
}

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

  /* Solo gestionamos peticiones GET. */
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /* Analítica y API dinámica: dejamos que vayan directo a la red. */
  if (estaExcluido(url)) {
    return;
  }

  /*
    Página principal e index.html:
    primero intenta descargar la versión nueva (network-first),
    y si no hay conexión sirve la copia en caché.
  */
  if (esPeticionNavegacion(request, url)) {
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

  /*
    Resto de recursos (banner, manifest y el CDN de ZXing):
    cache-first, guardando en caché lo que se descargue para
    poder reutilizarlo sin conexión.
  */
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(request).then(nueva => {
          if (nueva && (nueva.ok || nueva.type === "opaque")) {
            const copia = nueva.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copia));
          }

          return nueva;
        });
      })
  );
});
