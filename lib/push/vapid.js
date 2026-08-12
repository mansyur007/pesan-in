import webpush from 'web-push';
import { getDB } from '@/lib/db/index';

// Kunci VAPID untuk menandatangani push. Sama seperti SESSION_SECRET
// (lihat lib/auth/secret.js): prioritas env VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY;
// kalau kosong (mode demo/lokal), pasangan kunci dibuat sekali lalu disimpan di
// app_meta supaya subscription lama tidak basi tiap restart — tanpa setup eksternal.
let _keys;

export function getVapidKeys() {
  if (_keys) return _keys;

  const envPub = process.env.VAPID_PUBLIC_KEY;
  const envPriv = process.env.VAPID_PRIVATE_KEY;
  if (envPub && envPriv) {
    _keys = { publicKey: envPub, privateKey: envPriv };
    return _keys;
  }

  const db = getDB();
  const row = db.prepare("SELECT value FROM app_meta WHERE key = 'vapid_keys'").get();
  if (row?.value) {
    _keys = JSON.parse(row.value);
    return _keys;
  }

  const generated = webpush.generateVAPIDKeys();
  db.prepare("INSERT INTO app_meta (key, value) VALUES ('vapid_keys', ?)").run(JSON.stringify(generated));
  _keys = generated;
  return _keys;
}
