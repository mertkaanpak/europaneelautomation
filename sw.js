/* ════════════════════════════════════════════════════════════════════════
   EUROPANEEL — SERVICE WORKER (Offline-Funktion + schnelles Laden)
   Strategie: "stale-while-revalidate" — zeigt sofort die zwischengespeicherte
   Version (auch offline) und holt im Hintergrund die neueste; beim nächsten
   Öffnen ist sie aktuell. Bei größeren Updates CACHE-Version hochzählen.
   ════════════════════════════════════════════════════════════════════════ */
const CACHE = "europaneel-v1";
const ASSETS = [
  "index.html", "zellenrechner.html", "aggregatauswahl.html", "aggregate.html",
  "paneelrechner.html", "lagerbestand_tueren.html", "kalender.html",
  "style.css", "aggregate-data.js", "zelle3d.js", "pwa.js", "manifest.json",
  "logo.png", "icon-192.png", "icon-512.png",
  "img/govi-polarik-wand.png", "img/govi-polarik-decke.png",
  "img/zanotti-ps-wand.jpg", "img/zanotti-pc-decke.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))  // einzeln, damit ein fehlendes Asset nicht alles blockiert
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
