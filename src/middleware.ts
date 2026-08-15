import { NextRequest, NextResponse } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'aicas_enterprise_secure_session_secret_key_32bytes';

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
  '/admin',
];

const PUBLIC_API_PREFIXES = [
  '/api/auth',
];

interface DecodedSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  exp: number;
}

function decodeBase64Payload(base64Data: string): DecodedSession | null {
  try {
    const base64 = base64Data.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const jsonStr = decodeURIComponent(
      Array.from(binary)
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    try {
      const base64 = base64Data.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
}

async function verifyToken(token: string | undefined | null): Promise<DecodedSession | null> {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;

    const payload = decodeBase64Payload(base64Data);
    if (!payload || !payload.exp || Date.now() > payload.exp) {
      return null;
    }

    // Web Crypto API HMAC-SHA256 verification (Native Edge Runtime support)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SESSION_SECRET);
    const dataToSign = encoder.encode(base64Data);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
    const hexExpected = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (hexExpected !== signature) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieToken = req.cookies.get('aicas_session')?.value;
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const session = await verifyToken(cookieToken || bearerToken);
  const isAuthenticated = Boolean(session);

  // If user is authenticated and navigating to /login or /signup, redirect to /dashboard
  if ((pathname === '/login' || pathname === '/signup') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Handle protected API routes
  if (pathname.startsWith('/api/')) {
    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!isPublicApi && !isAuthenticated) {
      const response = NextResponse.json(
        { error: 'Unauthorized: Valid authentication session required to access enterprise API' },
        { status: 401 }
      );
      if (cookieToken && !session) {
        response.cookies.delete('aicas_session');
      }
      return response;
    }
    return NextResponse.next();
  }

  // Handle /admin authorization (Server-side RBAC)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
      const res = NextResponse.redirect(loginUrl);
      if (cookieToken) res.cookies.delete('aicas_session');
      return res;
    }

    if (session?.role !== 'ADMIN') {
      // Non-admin attempting to access /admin -> safe redirect to /dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // If request matches protected page prefix and is NOT authenticated, redirect to /login
  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
    const res = NextResponse.redirect(loginUrl);
    if (cookieToken) {
      res.cookies.delete('aicas_session');
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
