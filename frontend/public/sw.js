// AquaMart Service Worker for PWA & Web Push Notifications
const CACHE_NAME = 'aquamart-v1.2.0';
const STATIC_ASSETS = [
  '/',
  '/home',
  '/manifest.json',
  '/aquamart-logo.png'
];

// 1. INSTALL EVENT: Precache critical static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching partial failure, proceeding:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE EVENT: Clean up stale caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT: Stale-while-revalidate for static assets, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and API/Socket requests from caching
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached version or offline fallback if offline
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. PUSH EVENT: Handle background Web Push notification payloads
self.addEventListener('push', (event) => {
  let data = {
    title: 'AquaMart 🐟 Fresh Seafood Update',
    body: 'Fresh morning catch and special seafood offers are now live!',
    icon: '/aquamart-logo.png',
    badge: '/aquamart-logo.png',
    data: { url: '/home', type: 'promo' }
  };

  if (event.data) {
    try {
      const parsedData = event.data.json();
      data = { ...data, ...parsedData };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const title = data.title || 'AquaMart';
  const options = {
    body: data.body,
    icon: data.icon || '/aquamart-logo.png',
    badge: data.badge || '/aquamart-logo.png',
    image: data.image || undefined,
    tag: data.tag || `aquamart-${Date.now()}`,
    data: data.data || { url: '/home' },
    actions: data.actions || [
      { action: 'open_url', title: 'View Now 🌊' }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 5. NOTIFICATION CLICK EVENT: Navigate or focus active tab on click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/home';
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this app
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.navigate(fullUrl);
          return client.focus();
        }
      }
      // If no window is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })
  );
});
