import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/constants';

const PROTECTED = ['/merchant', '/buyer', '/driver', '/resto', '/cart', '/orders', '/account'];

// Middleware jalan di edge runtime, jadi tidak bisa verifikasi tanda tangan
// (secret-nya ada di sisi Node/DB). Di sini cukup cek bentuknya "<id>.<hmac>";
// verifikasi sesungguhnya tetap di getCurrentUser(). Cookie format lama
// (id polos, tanpa titik) otomatis dianggap kedaluwarsa dan dibuang.
function looksLikeSession(value) {
  if (!value) return false;
  const dot = value.lastIndexOf('.');
  return dot > 0 && dot < value.length - 1;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const raw = request.cookies.get(SESSION_COOKIE)?.value;

  if (needsAuth && !looksLikeSession(raw)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    const res = NextResponse.redirect(redirectUrl);
    if (raw) res.cookies.delete(SESSION_COOKIE);
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
