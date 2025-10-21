// sw.js - Service Worker متقدم للتطبيق
const CACHE_NAME = 'oasis-spiritual-v4';
const OFFLINE_URL = 'offline-content.html';

// الملفات التي سيتم تخزينها مؤقتاً
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/sounds.js',
  '/animations.css',
  '/pwa-config.js',
  '/manifest.json',
  OFFLINE_URL
];

// تركيب Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting();
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// إدارة الطلبات
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إرجاع الملف المخزن إذا موجود
        if (response) {
          return response;
        }

        // جلب من الشبكة
        return fetch(event.request)
          .then((response) => {
            // التحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // تخزين الاستجابة الجديدة
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // إذا فشل الاتصال، عرض صفحة عدم الاتصال
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// استقبال الرسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});