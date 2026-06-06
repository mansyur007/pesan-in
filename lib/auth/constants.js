// Konstanta auth aman untuk edge runtime (tanpa dependensi Node/DB).
export const SESSION_COOKIE = 'pesanin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export function roleHome(role) {
  if (role === 'merchant') return '/merchant';
  if (role === 'driver') return '/driver';
  return '/buyer';
}
