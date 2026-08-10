import { NextResponse } from 'next/server';
import { verifyLogin, createUser } from '@/lib/db/users';
import { SESSION_COOKIE, SESSION_MAX_AGE, roleHome, createSessionToken } from '@/lib/auth/session';
import { ROLES } from '@/lib/auth/constants';

export const runtime = 'nodejs';

function setSession(res, userId) {
  res.cookies.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
  const { action } = body;

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (action === 'login') {
    const user = verifyLogin(body.email || '', body.password || '');
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Email atau password salah.' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true, user, redirect: roleHome(user.role) });
    setSession(res, user.id);
    return res;
  }

  if (action === 'register') {
    const { fullName, email, phone, password, role } = body;
    if (!fullName || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Lengkapi semua isian wajib.' }, { status: 400 });
    }
    if (role != null && !ROLES.includes(role)) {
      return NextResponse.json({ ok: false, error: 'Role tidak valid.' }, { status: 400 });
    }
    const result = createUser({ fullName, email, phone, password, role: role || 'buyer' });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }
    const res = NextResponse.json({ ok: true, user: result.user, redirect: roleHome(result.user.role) });
    setSession(res, result.user.id);
    return res;
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}
