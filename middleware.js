import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/constants';

const PROTECTED = ['/merchant', '/buyer', '/driver', '/resto', '/cart', '/orders', '/account'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (needsAuth && !request.cookies.get(SESSION_COOKIE)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
