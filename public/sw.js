// Service worker Pesan.in — menampilkan notifikasi & menangani klik.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Push dari server (VAPID) — beda dari showNotification() yang dipanggil langsung
// oleh tab yang terbuka (lib/notify.js). Ini yang membuat notifikasi tetap masuk
// walau app/tab sedang tertutup.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data?.text() || '' };
  }
  const title = data.title || 'Pesan.in';
  const options = {
    body: data.body || '',
    tag: data.tag,
    data: data.data || {},
    icon: '/icon.svg',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
