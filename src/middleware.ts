import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/brands',
  '/campaigns',
  '/calendar',
  '/approvals',
  '/autonomy',
  '/settings',
  '/analytics',
  '/cost-governance',
  '/activity',
  '/incidents',
  '/recommendations',
  '/experiments',
  '/fatigue',
  '/localization',
  '/video',
  '/community',
];

const PUBLIC_API_PREFIXES = [
  '/api/auth',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get('aicas_session')?.value;
  const authHeader = req.headers.get('authorization');
  const hasBearer = Boolean(authHeader?.startsWith('Bearer '));
  const isAuthenticated = Boolean(sessionToken || hasBearer);

  // If user is authenticated and trying to access /login, redirect to /dashboard
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Handle protected API routes
  if (pathname.startsWith('/api/')) {
    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!isPublicApi && !isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access enterprise API' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // If request matches protected page prefix and is NOT authenticated, redirect to /login
  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

