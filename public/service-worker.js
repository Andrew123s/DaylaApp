// Service Worker for Dayla PWA
const CACHE_NAME = 'dayla-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/vite.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // CSS and JS will be added dynamically based on the build output
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch((error) => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Claim clients to ensure the SW is in control immediately
  event.waitUntil(self.clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip Supabase API requests (these should always be fresh)
  if (event.request.url.includes('supabase')) {
    return;
  }

  // For HTML navigation requests, use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For assets (JS, CSS, images), use stale-while-revalidate strategy
  if (event.request.destination === 'style' || 
      event.request.destination === 'script' || 
      event.request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              // Update the cache with the fresh response
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
            .catch((error) => {
              console.error('[Service Worker] Fetch failed:', error);
              // Return the cached response if available, or an error
              return cachedResponse || new Response('Network error', { status: 408 });
            });
          
          // Return the cached response immediately if available, otherwise wait for the network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // For other requests, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  } else if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Helper function for background sync of notes
async function syncNotes() {
  try {
    const db = await openDB();
    const pendingNotes = await db.getAll('pendingNotes');
    
    for (const note of pendingNotes) {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(note)
        });
        
        if (response.ok) {
          await db.delete('pendingNotes', note.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync note:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error in syncNotes:', error);
  }
}

// Helper function for background sync of expenses
async function syncExpenses() {
  try {
    const db = await openDB();
    const pendingExpenses = await db.getAll('pendingExpenses');
    
    for (const expense of pendingExpenses) {
      try {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(expense)
        });
        
        if (response.ok) {
          await db.delete('pendingExpenses', expense.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync expense:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error in syncExpenses:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('daylaOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingNotes')) {
        db.createObjectStore('pendingNotes', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingExpenses')) {
        db.createObjectStore('pendingExpenses', { keyPath: 'id' });
      }
    };
  });
}