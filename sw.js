// Cache de l'appli : la page s'ouvre hors connexion avec les dernières données reçues.
const VERSION = 'sorties-v1';
const COQUILLE = ['./', 'index.html', 'manifest.webmanifest', 'icone-180.png', 'icone-192.png', 'icone-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(COQUILLE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const donnees = url.pathname.endsWith('.json') || req.mode === 'navigate';
  if (donnees) {
    // réseau d'abord (données fraîches), cache si hors connexion
    e.respondWith(fetch(req).then((r) => { const copie = r.clone(); caches.open(VERSION).then((c) => c.put(req, copie)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
    return;
  }
  // le reste (icônes, polices) : cache d'abord
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((rep) => { const copie = rep.clone(); caches.open(VERSION).then((c) => c.put(req, copie)); return rep; })));
});
