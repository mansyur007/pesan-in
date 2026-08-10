import crypto from 'node:crypto';
import { getDB } from '@/lib/db/index';

// Secret untuk menandatangani cookie session.
// Prioritas: env SESSION_SECRET. Kalau tidak diset (mode demo/lokal), secret acak
// dibuat sekali lalu disimpan di DB agar session tetap valid setelah restart —
// tanpa perlu setup eksternal, dan tanpa default yang bisa ditebak.
let _secret;

export function getSessionSecret() {
  if (_secret) return _secret;

  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv) {
    _secret = fromEnv;
    return _secret;
  }

  const db = getDB();
  const row = db.prepare("SELECT value FROM app_meta WHERE key = 'session_secret'").get();
  if (row?.value) {
    _secret = row.value;
    return _secret;
  }

  const generated = crypto.randomBytes(32).toString('hex');
  db.prepare("INSERT INTO app_meta (key, value) VALUES ('session_secret', ?)").run(generated);
  _secret = generated;
  return _secret;
}
