// =============================================
// TRAKIO Service Worker v1.0.0
// Cache & Offline Support
// =============================================

const CACHE_NAME = 'trakio-cache-v3.2.9';
const OFFLINE_URL = '/offline.html';

// Fichiers à mettre en cache immédiatement
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/articles.html',
  '/clients.html',
  '/commandes.html',
  '/myfish.html',
  '/compta.html',
  '/shopify.html',
  '/live.html',
  '/whatsapp.html',
  '/tracabilite.html',
  '/offline.html',
  '/manifest.json',
  // Fonts Google
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap',
  // CDN Libraries
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];

// URLs à toujours récupérer depuis le réseau
const NETWORK_ONLY = [
  '/api/',
  'dropbox.com',
  'api.whatsapp.com'
];

// =============================================
// INSTALLATION
// =============================================
self.addEventListener('install', (event) => {
  console.log('🐟 TRAKIO SW: Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🐟 TRAKIO SW: Mise en cache des assets...');
        return cache.addAll(PRECACHE_ASSETS.map(url => {
          return new Request(url, { mode: 'cors' });
        })).catch(err => {
          console.warn('🐟 TRAKIO SW: Erreur cache partiel:', err);
          // Continue même si certains fichiers échouent
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('🐟 TRAKIO SW: Installation terminée!');
        return self.skipWaiting();
      })
  );
});

// =============================================
// ACTIVATION
// =============================================
self.addEventListener('activate', (event) => {
  console.log('🐟 TRAKIO SW: Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('🐟 TRAKIO SW: Suppression ancien cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('🐟 TRAKIO SW: Activation terminée!');
        return self.clients.claim();
      })
  );
});

// =============================================
// FETCH - Stratégie Cache First avec fallback
// =============================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return;
  
  // Network only pour certaines URLs
  if (NETWORK_ONLY.some(pattern => url.href.includes(pattern))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Stratégie: Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Retourner le cache et mettre à jour en arrière-plan
          fetchAndCache(event.request);
          return cachedResponse;
        }
        
        // Pas en cache, récupérer depuis le réseau
        return fetchAndCache(event.request);
      })
      .catch(() => {
        // Offline - retourner page offline pour navigation
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Fetch et mise en cache
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    // Ne cacher que les réponses valides
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

// =============================================
// NOTIFICATIONS PUSH
// =============================================
self.addEventListener('push', (event) => {
  console.log('🐟 TRAKIO SW: Notification push reçue');
  
  let data = {
    title: 'TRAKIO',
    body: 'Nouvelle notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: 'trakio-notification',
    data: {}
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions || [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ],
    requireInteraction: data.urgent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('🐟 TRAKIO SW: Clic notification', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Chercher une fenêtre TRAKIO déjà ouverte
        for (const client of windowClients) {
          if (client.url.includes('trakio') && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// =============================================
// SYNC EN ARRIÈRE-PLAN
// =============================================
self.addEventListener('sync', (event) => {
  console.log('🐟 TRAKIO SW: Background sync', event.tag);
  
  if (event.tag === 'trakio-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Cette fonction sera appelée quand la connexion revient
  // Envoyer les données en attente vers le cloud
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_READY',
      message: 'Connexion rétablie - synchronisation possible'
    });
  });
}

// =============================================
// MESSAGES DEPUIS L'APP
// =============================================
self.addEventListener('message', (event) => {
  console.log('🐟 TRAKIO SW: Message reçu', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_URLS') {
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(event.data.urls);
    });
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('🐟 TRAKIO SW: Cache vidé');
    });
  }
});

console.log('🐟 TRAKIO Service Worker chargé - v3.2.9');
