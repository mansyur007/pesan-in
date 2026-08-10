import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/db/users';
import { SESSION_COOKIE } from '@/lib/auth/constants';
import { getSessionSecret } from '@/lib/auth/secret';

export { SESSION_COOKIE, SESSION_MAX_AGE, roleHome } from '@/lib/auth/constants';

// Isi cookie: "<userId>.<hmac>". Tanpa tanda tangan yang cocok, cookie ditolak —
// jadi user id saja tidak cukup untuk menyamar jadi orang lain.
function sign(userId) {
  return crypto.createHmac('sha256', getSessionSecret()).update(userId).digest('base64url');
}

export function createSessionToken(userId) {
  return `${userId}.${sign(userId)}`;
}

// Kembalikan user id bila tanda tangan valid, selain itu null.
export function readSessionToken(raw) {
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot <= 0) return null;

  const userId = raw.slice(0, dot);
  const given = Buffer.from(raw.slice(dot + 1));
  const expected = Buffer.from(sign(userId));
  if (given.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(given, expected)) return null;

  return userId;
}

// Baca user dari cookie session → verifikasi tanda tangan → lookup DB lokal.
// Return { id, full_name, email, role, ... } atau null.
export async function getCurrentUser() {
  const id = readSessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return getUserById(id);
}
