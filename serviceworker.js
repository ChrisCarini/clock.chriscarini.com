// Choose a cache name
const cacheName = 'clock.chriscarini.com';

// List the files to precache
const precacheResources = [
    '/index.html',
    '/style.css',
    '/clock.js',
];

// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
    console.log('Service worker install event!');
    event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activate event!');

    function insideInstalledApp() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
    }

    function forceScreenSize(width, height) {
        if (insideInstalledApp()) {
            // Size window after open the app
            window.resizeTo(width, height)

            window.addEventListener('resize', () => {
                window.resizeTo(width, height)
            })
        }
    }

    forceScreenSize(1200, 400)
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        }),
    );
});