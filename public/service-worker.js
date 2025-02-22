self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("al-quran-cache-v1").then((cache) => {
      return cache.addAll(["/", "/index.html", "/logo/logo-192x.png", "/logo/logo-256x.png", "/logo/logo-384x.png", "/logo/logo-512x.png"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
