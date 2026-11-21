const CACHE = "lirael-sheet-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png",
  "./fonts/cinzel-decorative-latin-700-normal.woff2", "./fonts/cinzel-latin-600-normal.woff2", "./fonts/cinzel-latin-700-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  // only clear this app's own old caches (other character apps may share the same site)
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("lirael-sheet-") && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Network first for the page itself (so updates arrive), cache as fallback offline.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("./index.html", c)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  // Everything else (icons, fonts): cache first, then fetch and remember.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && (r.ok || r.type === "opaque")) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
    return r;
  }).catch(() => hit)));
});
