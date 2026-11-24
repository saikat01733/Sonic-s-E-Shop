import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sonic-eshop-production-jwt-secret-key-2026-safe-guard'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Guard for /admin pages
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('sonic_session')?.value;
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload?.role;
      if (role !== 'admin' && role !== 'super_admin' && role !== 'staff') {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('error', 'insufficient_privileges');
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|banner\\.|logo\\.).*)'],
};
