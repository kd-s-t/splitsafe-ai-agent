// Check if we're in development mode
const IS_DEVELOPMENT = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

const CACHE_NAME = 'splitsafe-v6-no-cache'; // Bumped version to force cache clear
const STATIC_CACHE_URLS = [
    '/',
    '/dashboard',
    '/escrow',
    '/transactions',
    '/vouchers',
    '/settings',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/apple-touch-icon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing... (Cache version: v5)');
    
    // Immediately skip waiting to activate new service worker and clear old caches
    event.waitUntil(
        Promise.resolve()
            .then(() => {
    if (IS_DEVELOPMENT) {
        console.log('Service Worker: Development mode - skipping cache installation');
                    return self.skipWaiting();
    }
    
                // Open cache but don't wait for it - activate immediately to clear old caches
        caches.open(CACHE_NAME)
            .then((cache) => {
                        console.log('Service Worker: Opening new cache');
                        // Optionally cache assets in background, but don't wait
                        Promise.allSettled(
                    STATIC_CACHE_URLS.map(url =>
                        cache.add(url).catch(error => {
                            console.warn(`Service Worker: Failed to cache ${url}:`, error);
                                    return null;
                        })
                    )
                        ).then((results) => {
                const successful = results.filter(result => result.status === 'fulfilled').length;
                            console.log(`Service Worker: Cached ${successful} assets in background`);
                        });
            })
            .catch((error) => {
                        console.warn('Service Worker: Cache open failed (non-critical):', error);
                    });
                
                // Skip waiting immediately to activate and clear old caches
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    // Clear only old caches, keep the current one
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                console.log('Service Worker: Found caches:', cacheNames);
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Only delete old caches, not the current one
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        } else {
                            console.log('Service Worker: Keeping current cache', cacheName);
                            return Promise.resolve();
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Old caches cleared, activation complete');
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('Service Worker: Error during activation', error);
                return self.clients.claim();
            })
    );
});

// Fetch event - SPA mode: serve index.html for navigation, cache static assets
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip requests to external APIs
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    const url = new URL(event.request.url);

    // For navigation requests (page loads), always serve index.html for SPA routing
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            caches.match('/')
                .then((cachedIndex) => {
                    if (cachedIndex) {
                        return cachedIndex;
                    }
                    // Fetch fresh index.html from network
                    return fetch('/').catch(() => {
                        // If offline, try to return cached index
                        return caches.match('/');
                    });
                })
        );
        return;
    }

    // For JavaScript module scripts, always fetch from network (no caching)
    // This prevents stale cached JS from breaking the app
    if (url.pathname.match(/\.js$/) && url.pathname.startsWith('/assets/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Only fall back to cache if network fails
                return caches.match(event.request);
            })
        );
        return;
    }

    // For static assets (_next/static, images, fonts, CSS, etc.), use cache-first strategy
    const isStaticAsset = url.pathname.startsWith('/_next/static/') ||
                         url.pathname.startsWith('/_next/') ||
                         url.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|css)$/);

    if (isStaticAsset) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then((response) => {
                        // Cache successful static asset responses
                        if (response && response.status === 200 && response.type === 'basic') {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                        return response;
                    });
                })
        );
        return;
    }

    // For API calls and dynamic content, always fetch fresh (no caching)
    if (url.pathname.startsWith('/api/') ||
        url.searchParams.has('_t') || // Cache-busted requests
        event.request.url.includes('getBusinessLogs') ||
        event.request.url.includes('getTransactionsPaginated')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // For all other requests, network first
    event.respondWith(
        fetch(event.request).catch(() => {
            // If offline, try cache
            return caches.match(event.request);
        })
    );
});

// Push event - handle push notifications from Pusher
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'SplitSafe', body: event.data.text() };
        }
    }

    const options = {
        body: data.body || 'You have a new notification',
        icon: data.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
            primaryKey: data.id || '1',
            ...data
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'SplitSafe', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        if (urlToOpen !== '/') {
                            client.navigate(urlToOpen);
                        }
                        return;
                    }
                }

                // Open new window if app is not open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle any pending offline actions here
            // For example, sync pending transactions when back online
            syncPendingActions()
        );
    }
});

// Helper function for background sync
async function syncPendingActions() {
    try {
        // Get pending actions from IndexedDB or localStorage
        // This would be implemented based on your specific offline needs
        console.log('Service Worker: Syncing pending actions');
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
    }
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('Service Worker: Clearing all caches...');
        // Only process if there's a message channel port
        if (event.ports && event.ports[0]) {
            const port = event.ports[0];
            event.waitUntil(
                caches.keys()
                    .then((cacheNames) => {
                        return Promise.all(
                            cacheNames.map((cacheName) => {
                                console.log('Service Worker: Deleting cache', cacheName);
                                return caches.delete(cacheName);
                            })
                        );
                    })
                    .then(() => {
                        console.log('Service Worker: All caches cleared');
                        // Send confirmation back to client
                        port.postMessage({ success: true, message: 'All caches cleared' });
                    })
                    .catch((error) => {
                        console.error('Service Worker: Error clearing caches', error);
                        port.postMessage({ success: false, error: error.message });
                    })
            );
        } else {
            // No port provided, just clear caches without response
            event.waitUntil(
                caches.keys()
                    .then((cacheNames) => {
                        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                    })
                    .then(() => {
                        console.log('Service Worker: All caches cleared (no response port)');
                    })
                    .catch((error) => {
                        console.error('Service Worker: Error clearing caches', error);
                    })
            );
        }
    }
});
