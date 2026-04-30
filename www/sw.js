// CitizenConnect Service Worker - enables offline & PWA install
const CACHE_NAME = 'citizenconnect-v8';
const ASSETS = [
  '/',
  '/login.html',
  '/index.html',
  '/report-form.html',
  '/admin-dashboard.html',
  '/staff-dashboard.html',
  '/styles.css',
  '/auth.js',
  '/reports.js',
  '/script.js',
  '/mobile.js',
  '/favicon.svg',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
