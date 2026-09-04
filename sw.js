const CACHE = 'rotas-cache-v4';
const URLS = [
    'app.html',
    'index.html',
    'manifest.json',
    'icon.svg',
    'icon-48.png',
    'icon-72.png',
    'icon-96.png',
    'icon-128.png',
    'icon-144.png',
    'icon-152.png',
    'icon-192.png',
    'icon-256.png',
    'icon-384.png',
    'icon-512.png',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v143/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(URLS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (url.origin === 'https://router.project-osrm.org' || url.origin === 'https://nominatim.openstreetmap.org') {
        e.respondWith(networkFirst(e.request));
    } else {
        e.respondWith(cacheFirst(e.request));
    }
});

async function cacheFirst(req) {
    const cached = await caches.match(req);
    return cached || fetch(req).then(r => { caches.open(CACHE).then(c => c.put(req, r.clone())); return r; });
}

async function networkFirst(req) {
    try {
        const res = await fetch(req);
        return res;
    } catch {
        const cached = await caches.match(req);
        return cached || new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
}

self.addEventListener('push', e => {
    let data = { title: 'Rotas Inteligentes', body: '', icon: '/icon-192.png' };
    try { if (e.data) data = { ...data, ...e.data.json() }; } catch {}
    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: '/icon-96.png',
            vibrate: [200, 100, 200],
            sound: 'default',
            tag: 'rota-notificacao',
            requireInteraction: true
        })
    );
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) {
                clientList[0].focus();
            } else {
                clients.openWindow('./app.html');
            }
        })
    );
});
