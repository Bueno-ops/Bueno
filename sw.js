const CACHE = 'rotas-cache-v1';
const URLS = [
    'app.html',
    'manifest.json',
    'icon.svg',
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
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
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
