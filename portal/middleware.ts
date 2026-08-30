import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'archivist-central-portal-super-secret-jwt-key-2026'
);
const COOKIE_NAME = 'archivist_session_token';

const protectedPaths = ['/dashboard', '/files', '/analytics', '/network', '/profile', '/settings'];
const authPaths = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname === path);

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/files/:path*', '/analytics/:path*', '/network/:path*', '/profile/:path*', '/settings/:path*', '/login', '/register'],
};
