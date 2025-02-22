self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open("al-quran-cache-v1")
      .then((cache) => {
        try {
          return cache.addAll(["/", "/index.html", "/logo/logo-192x.png", "/logo/logo-256x.png", "/logo/logo-384x.png", "/logo/logo-512x.png"]);
        } catch (error) {
          console.error("Gagal menambahkan cache", error);
        }
      })
      .catch((error) => {
        console.error("Gagal membuka cache", error);
      })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    cache
      .match(event.request)
      .then((response) => {
        if (response && response.ok) {
          return response;
        } else {
          return fetch(event.request);
        }
      })
      .catch((error) => {
        console.error("Gagal mengambil response", error);
      })
  );
});
