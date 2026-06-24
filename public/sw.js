// Service worker for PWA install + Web Push (R34, R35, R36).
// Skeleton: handles push delivery + notification clicks. Subscriptions are created
// client-side and stored server-side; a scheduled job (Vercel Cron / Supabase
// scheduled function) evaluates monster state and sends the pushes (R36).
// NOTE: not wired to a real push service in this environment.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  const data = (() => {
    try { return event.data ? event.data.json() : {}; } catch { return {}; }
  })();
  const title = data.title || 'Bicho Battler';
  const body = data.body || 'Tu bicho te necesita.';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(self.clients.openWindow(url));
});
