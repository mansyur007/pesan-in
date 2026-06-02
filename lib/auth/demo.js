// Demo auth — aktif otomatis kalau NEXT_PUBLIC_SUPABASE_URL kosong.
// Cookie-based, TIDAK untuk production. Saat Supabase env diisi, path ini
// bypassed dan yang dipakai auth Supabase sungguhan.

export const DEMO_COOKIE = 'pesanin_demo_user';
export const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export const DEMO_USERS = [
  {
    id: 'demo-merchant-001',
    email: 'merchant@demo.test',
    password: 'demo123',
    role: 'merchant',
    full_name: 'Budi Kedai Gunungpati',
  },
  {
    id: 'demo-buyer-001',
    email: 'buyer@demo.test',
    password: 'demo123',
    role: 'buyer',
    full_name: 'Siti Pembeli',
  },
  {
    id: 'demo-driver-001',
    email: 'driver@demo.test',
    password: 'demo123',
    role: 'driver',
    full_name: 'Andi Driver',
  },
];

export function isDemoMode() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function findDemoUser(email, password) {
  const u = DEMO_USERS.find((x) => x.email === email.trim().toLowerCase());
  if (!u || u.password !== password) return null;
  const { password: _, ...safe } = u;
  return safe;
}

export function encodeSession(user) {
  return Buffer.from(JSON.stringify(user), 'utf8').toString('base64');
}

export function decodeSession(raw) {
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export function roleHome(role) {
  if (role === 'merchant') return '/merchant';
  if (role === 'driver') return '/driver';
  return '/buyer';
}
