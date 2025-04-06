const CACHE_NAME = 'plug-and-save-v1';
const urlsToCache = [
    './',
    './index.html',
    './login.html',
    './signup.html',
    './dashboard.html',
    './addDevice.html',
    './setup-profile.html',
    './device-details.html',
    './css/styles.css',
    './js/auth.js',
    './js/script.js',
    './js/dashboard.js',
    './js/addDevice.js',
    './js/device-details.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return Promise.all(
                    urlsToCache.map(url => {
                        return fetch(url)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`Failed to fetch ${url}`);
                                }
                                return cache.put(url, response);
                            })
                            .catch(error => {
                                console.error(`Failed to cache ${url}:`, error);
                            });
                    })
                );
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and non-http(s) requests
    if (event.request.method !== 'GET' || 
        !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Only cache our app's files
                        const url = new URL(event.request.url);
                        if (url.origin === location.origin) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(error => {
                                    console.error('Failed to cache response:', error);
                                });
                        }

                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        // Return a fallback response if available
                        return caches.match('./offline.html');
                    });
            })
    );
}); 