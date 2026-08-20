const CACHE_NAME = "free-ai-shell-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;
  if (req.url.includes("pollinations.ai")) return;

  const url = new URL(req.url);
  const isAppHTML =
    req.mode === "navigate" ||
    (url.origin === self.location.origin &&
      (url.pathname.endsWith(".html") || url.pathname === "/"));

  if (isAppHTML) {
    // Network-first for the app's own HTML: always try to get the latest
    // version first, so edits show up on the very next load instead of
    // being one refresh behind. Falls back to cache only when offline.
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          if (res && res.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return (
            cached ||
            new Response("Offline and this page wasn't cached yet.", {
              status: 503,
              statusText: "Offline",
            })
          );
        })
    );
    return;
  }

  // Cache-first for everything else — libraries, model weights, map tiles.
  // These are versioned/immutable by URL, so serving cached copies instantly
  // is safe and is what makes offline use and fast reloads work.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);

      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => null);

      if (cached) return cached;

      const netRes = await networkFetch;
      if (netRes) return netRes;

      return new Response("Offline and this resource wasn't cached yet.", {
        status: 503,
        statusText: "Offline",
      });
    })
  );
});
