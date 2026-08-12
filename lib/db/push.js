import { getDB } from './index';

// Simpan/perbarui subscription push satu device. endpoint unik per device+browser,
// jadi login ulang di device yang sama memindahkan kepemilikannya ke user saat ini
// (mis. logout lalu login akun lain di HP yang sama).
export function saveSubscription(userId, sub) {
  const db = getDB();
  db.prepare(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`
  ).run(userId, sub.endpoint, sub.keys.p256dh, sub.keys.auth);
}

// Tanpa userId: dipakai internal saat subscription terbukti tidak valid lagi
// (404/410 dari push service), jadi kepemilikan tidak relevan.
// Dengan userId: dipakai dari endpoint API supaya user tidak bisa menghapus
// subscription device orang lain walau endpoint-nya (tidak sengaja) diketahui.
export function removeSubscription(endpoint, userId) {
  const db = getDB();
  if (userId) {
    db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?').run(endpoint, userId);
  } else {
    db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(endpoint);
  }
}

export function getSubscriptionsForUser(userId) {
  const db = getDB();
  return db.prepare('SELECT * FROM push_subscriptions WHERE user_id = ?').all(userId);
}
