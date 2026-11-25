/* E PUSKESOS service worker: cache kerangka aplikasi agar bisa dibuka cepat dan tetap tampil saat sinyal buruk.
   Data (Firebase) tidak pernah disimpan di sini. Naikkan VERSI setiap kali index.html diperbarui. */
const VERSI = 'puskesos-v12';
const INTI = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const LUAR = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(INTI)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSI).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    // halaman: coba jaringan dulu, jika gagal pakai salinan terakhir
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VERSI).then(c => c.put('index.html', cp)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  if (u.origin === location.origin || LUAR.includes(u.hostname)) {
    // berkas statis: pakai salinan, perbarui di belakang layar
    e.respondWith(caches.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(VERSI).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
