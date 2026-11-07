// Service hors ligne de LA FORGE : tous les fichiers de l'application sont gardés sur l'appareil à l'installation
// (liste et version dans precache.js). Aucune donnée personnelle ne passe par ici : elles restent dans le stockage du navigateur.
importScripts('precache.js');
const CACHE = 'la-forge-' + self.PRECACHE_VERSION;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(self.PRECACHE.map(p => new Request(p, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('la-forge-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// D'abord le cache (fonctionne sans réseau), sinon le réseau ; une page demandée hors ligne retombe sur l'application.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => req.mode === 'navigate' ? caches.match('./') : Response.error())));
});
