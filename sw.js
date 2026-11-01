// Service worker: guarda la app en el celular para que abra sin internet.
// Si cambiás index.html y lo volvés a subir, cambiá también este número de versión.
const CACHE = "ilposto-movil-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Responde desde el celular al instante y, si hay internet, actualiza en segundo plano.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cacheado) => {
      const red = fetch(e.request)
        .then((resp) => {
          if (resp && resp.ok) {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copia));
          }
          return resp;
        })
        .catch(() => cacheado);
      return cacheado || red;
    })
  );
});
