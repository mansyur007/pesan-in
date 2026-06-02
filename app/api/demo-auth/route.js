import { NextResponse } from 'next/server';
import {
  DEMO_COOKIE, DEMO_COOKIE_MAX_AGE, findDemoUser, encodeSession, roleHome,
} from '@/lib/auth/demo';

export async function POST(req) {
  const { action, email, password } = await req.json();

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(DEMO_COOKIE);
    return res;
  }

  if (action === 'login') {
    const user = findDemoUser(email || '', password || '');
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Email atau password salah.' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true, user, redirect: roleHome(user.role) });
    res.cookies.set(DEMO_COOKIE, encodeSession(user), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: DEMO_COOKIE_MAX_AGE,
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}
