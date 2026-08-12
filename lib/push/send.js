import webpush from 'web-push';
import { getVapidKeys } from './vapid';
import { getSubscriptionsForUser, removeSubscription } from '@/lib/db/push';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const { publicKey, privateKey } = getVapidKeys();
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@pesan.in', publicKey, privateKey);
  configured = true;
}

// Kirim push ke semua device milik user. Best-effort: kegagalan tidak dilempar
// ke pemanggil (harus tidak pernah menggagalkan aksi pesanan yang memicunya),
// dan subscription yang sudah tidak valid (404/410 — browser uninstall/reset)
// otomatis dibuang supaya tidak dicoba lagi tiap event berikutnya.
export async function sendPushToUser(userId, payload) {
  if (!userId) return;
  ensureConfigured();
  const subs = getSubscriptionsForUser(userId);
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body);
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) removeSubscription(s.endpoint);
      }
    })
  );
}
