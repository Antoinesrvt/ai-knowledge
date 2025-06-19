import { getToken } from 'next-auth/jwt';
import { guestRegex, isDevelopmentEnvironment } from './lib/constants';
import { NextRequest, NextResponse } from 'next/server';

// Routes that allow unauthenticated access to public content
const PUBLIC_CONTENT_ROUTES = ['/document/', '/chat/'];
// Routes that require regular user authentication (blocked for guests)
const REGULAR_USER_ONLY_ROUTES = ['/dashboard'];
// Routes that allow unauthenticated access
const UNAUTHENTICATED_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  const isGuest = token ? guestRegex.test(token?.email ?? '') : false;
  const isPublicContentRoute = PUBLIC_CONTENT_ROUTES.some(route => pathname.startsWith(route));
  const isRegularUserOnlyRoute = REGULAR_USER_ONLY_ROUTES.some(route => pathname.startsWith(route));
  const isUnauthenticatedRoute = UNAUTHENTICATED_ROUTES.includes(pathname);

  // Allow unauthenticated access to login, register, and public content routes
  if (!token) {
    if (isUnauthenticatedRoute || isPublicContentRoute) {
      const response = NextResponse.next();
      response.headers.set('x-pathname', pathname);
      response.headers.set('x-user-type', 'unauthenticated');
      return response;
    }
    
    // Redirect all other pages to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Block guest users from dashboard and other regular-user-only routes
  if (isGuest && isRegularUserOnlyRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated regular users away from login/register
  if (token && !isGuest && isUnauthenticatedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add headers for layout detection and user type
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  response.headers.set('x-user-type', isGuest ? 'guest' : 'regular');
  return response;
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/document/:path*',
    '/api/:path*',
    '/login',
    '/register',
    '/dashboard/:path*',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
