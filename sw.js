/* Cahier de Transformation : fonctionnement sans internet. L'application est servie depuis le téléphone, puis mise à jour en arrière-plan quand il y a du réseau. */
const CACHE = 'cahier-transformation-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
/* Ne supprime que les anciennes versions de CETTE application (Cahier de Boutique peut être sur le même site) */
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cahier-transformation') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, {ignoreSearch: true}) || (u.pathname.endsWith('/') ? await c.match('./') : null);
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(u.pathname.endsWith('/') ? './' : u.pathname, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
