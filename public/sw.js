const CACHE_NAME = 'taglist-v2.0.0';
const STATIC_CACHE = 'taglist-static-v2.0.0';
const DYNAMIC_CACHE = 'taglist-dynamic-v2.0.0';
const IMAGE_CACHE = 'taglist-images-v2.0.0';

// Cache süresi (milisaniye)
const CACHE_DURATION = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 gün
  DYNAMIC: 24 * 60 * 60 * 1000,    // 1 gün
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 gün
  API: 5 * 60 * 1000,              // 5 dakika
};

// Statik dosyalar listesi
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Kurulum olayı
self.addEventListener('install', (event) => {
  console.log('SW: Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Failed to cache static assets:', error);
      })
  );
});

// Aktivasyon olayı
self.addEventListener('activate', (event) => {
  console.log('SW: Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
        
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!validCaches.includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch olayı - Network stratejileri
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // CORS isteklerini işle
  if (url.origin !== location.origin) {
    return;
  }

  // POST, PUT, DELETE isteklerini cache'leme
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(handleRequest(request));
});

// İstek işleme fonksiyonu
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Statik dosyalar - Cache First
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Resimler - Cache First
    if (isImageRequest(request)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }
    
    // API istekleri - Network First
    if (isApiRequest(url)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Sayfalar - Stale While Revalidate
    if (isPageRequest(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Diğer istekler - Network Only
    return await fetch(request);
    
  } catch (error) {
    console.error('SW: Request failed:', error);
    
    // Offline sayfası göster
    if (isPageRequest(url)) {
      const cache = await caches.open(STATIC_CACHE);
      const offlinePage = await cache.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Cache First strateji
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached && !isCacheExpired(cached, CACHE_DURATION.STATIC)) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      responseToCache.headers.set('sw-cached-at', Date.now().toString());
      await cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Network First strateji
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = response.clone();
      responseToCache.headers.set('sw-cached-at', Date.now().toString());
      await cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Stale While Revalidate strateji
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Arka planda güncelle
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const responseToCache = response.clone();
        responseToCache.headers.set('sw-cached-at', Date.now().toString());
        cache.put(request, responseToCache);
      }
      return response;
    })
    .catch(() => {
      // Network hatası durumunda cached versiyonu döndür
      return cached;
    });
  
  // Cache'den varsa hemen döndür, yoksa network'ten bekle
  return cached || await fetchPromise;
}

// Yardımcı fonksiyonlar
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.includes('/_nuxt/') ||
         url.pathname === '/' ||
         url.pathname === '/manifest.json';
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(new URL(request.url).pathname);
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('api.') ||
         url.pathname.includes('/trpc/');
}

function isPageRequest(url) {
  return url.pathname.startsWith('/') && 
         !isStaticAsset(url) && 
         !isApiRequest(url) &&
         !url.pathname.includes('.');
}

function isCacheExpired(response, duration) {
  if (!response.headers.has('sw-cached-at')) {
    return true;
  }
  
  const cachedAt = parseInt(response.headers.get('sw-cached-at'), 10);
  const now = Date.now();
  
  return (now - cachedAt) > duration;
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Offline sırasında kaydedilen verileri senkronize et
    const pendingData = await getStoredData('pending-sync');
    
    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          await fetch(data.url, data.options);
          console.log('SW: Background sync successful for:', data.url);
        } catch (error) {
          console.error('SW: Background sync failed for:', data.url, error);
        }
      }
      
      // Başarılı senkronizasyon sonrası verileri temizle
      await clearStoredData('pending-sync');
    }
  } catch (error) {
    console.error('SW: Background sync error:', error);
  }
}

// Push bildirimleri
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  let options = {
    body: 'TagList\'ten yeni bir bildirim!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Görüntüle',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      options = { ...options, ...payload };
    } catch (error) {
      console.error('SW: Failed to parse push payload:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('TagList', options)
  );
});

// Bildirim tıklama
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Hiçbir şey yapma, sadece bildirimi kapat
  } else {
    // Varsayılan davranış - ana sayfayı aç
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      cacheUrls(event.data.urls)
    );
  }
});

// URL'leri cache'e alma
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
    console.log('SW: URLs cached successfully');
  } catch (error) {
    console.error('SW: Failed to cache URLs:', error);
  }
}

// IndexedDB yardımcı fonksiyonlar
async function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TagListDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncData'], 'readonly');
      const store = transaction.objectStore('syncData');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => resolve(getRequest.result?.data);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('syncData')) {
        db.createObjectStore('syncData', { keyPath: 'key' });
      }
    };
  });
}

async function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TagListDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncData'], 'readwrite');
      const store = transaction.objectStore('syncData');
      const deleteRequest = store.delete(key);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

console.log('SW: Service Worker loaded and ready!');
