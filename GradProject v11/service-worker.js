// Service Worker for Plug&Save
const CACHE_NAME = 'plug-and-save-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/dashboard.html',
  '/addDevice.html',
  '/device-details.html',
  '/profile-settings.html',
  '/css/styles.css',
  '/js/auth.js',
  '/js/script.js',
  '/js/dashboard.js',
  '/js/device-details.js',
  '/js/addDevice.js',
  '/js/profile-settings.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
}); 