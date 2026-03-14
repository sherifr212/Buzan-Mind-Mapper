/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// Injected precache manifest by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Purge outdated caches on activation
cleanupOutdatedCaches();

// Activate immediately — claim all clients
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Purge any caches not matching current version prefixes
      const cacheNames = await caches.keys();
      const currentCaches = [
        'app-shell-v1',
        'static-assets-v1',
        'api-maps-v1',
        'api-map-detail-v1',
        'api-user-v1',
        'user-media-v1',
        'navigation-v1',
        'workbox-precache-v2',
      ];
      await Promise.all(
        cacheNames
          .filter((name) => !currentCaches.some((c) => name.startsWith(c)))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// Only cache GET requests
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
});

// Static assets — Cache First
registerRoute(
  ({ request }) =>
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-assets-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  }),
);

// API map list — Network First
registerRoute(
  ({ url }) => url.pathname === '/api/maps' || url.pathname.startsWith('/api/maps?'),
  new NetworkFirst({
    cacheName: 'api-maps-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
);

// Single map detail — StaleWhileRevalidate
registerRoute(
  ({ url }) => /^\/api\/maps\/[^/]+$/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'api-map-detail-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  }),
);

// User profile — Network First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/user'),
  new NetworkFirst({
    cacheName: 'api-user-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 60 * 60,
      }),
    ],
  }),
);

// User media / avatars — Cache First
registerRoute(
  ({ url }) => url.pathname.startsWith('/media/') || url.pathname.startsWith('/avatars/'),
  new CacheFirst({
    cacheName: 'user-media-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

// Navigation (SPA routes) — Network First with offline fallback
const navigationHandler = new NetworkFirst({
  cacheName: 'navigation-v1',
  plugins: [],
});

registerRoute(
  new NavigationRoute(async (options) => {
    try {
      return await navigationHandler.handle(options);
    } catch {
      const cache = await caches.open('workbox-precache-v2');
      const offlinePage = await cache.match('/offline.html');
      return offlinePage || new Response('Offline', { status: 503 });
    }
  }),
);

// Background Sync for offline mutations
const bgSyncPlugin = new BackgroundSyncPlugin('bmm-sync-queue', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
});

// Register background sync tag
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'bmm-sync-queue') {
    event.waitUntil(
      // Notify all clients to flush the sync queue
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'SYNC_QUEUE_FLUSH' }),
        );
      }),
    );
  }
});

// Stubbed push event listener (scaffold for v2)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received (v2 scaffold):', event);
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
