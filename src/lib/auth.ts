import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { auditService } from '@/lib/services/audit-service';

const SESSION_COOKIE_NAME = 'aicas_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'aicas_enterprise_secure_session_secret_key_32bytes';

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  exp: number;
}

/**
 * Sign session payload to token string.
 */
export function signSessionPayload(payload: Omit<UserSessionPayload, 'createdAt' | 'exp'>, rememberMe: boolean = false): string {
  const now = Date.now();
  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const fullPayload: UserSessionPayload = {
    ...payload,
    createdAt: now,
    exp: now + duration,
  };

  const jsonStr = JSON.stringify(fullPayload);
  const base64Data = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Data)
    .digest('hex');

  return `${base64Data}.${signature}`;
}

/**
 * Verify and decode session token string.
 */
export function verifySessionToken(token: string | undefined | null): UserSessionPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64Data)
      .digest('hex');

    if (signature !== expectedSig) return null;

    const jsonStr = Buffer.from(base64Data, 'base64url').toString('utf-8');
    const payload: UserSessionPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract session from incoming NextRequest or Cookie header.
 */
export function getSessionFromRequest(req: NextRequest): UserSessionPayload | null {
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) {
    const session = verifySessionToken(cookieToken);
    if (session) return session;
  }

  // Fallback to Bearer token in Authorization header if provided
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    return verifySessionToken(bearerToken);
  }

  return null;
}

/**
 * Set HTTP-Only Session Cookie on NextResponse.
 */
export function setSessionCookie(res: NextResponse, token: string, rememberMe: boolean = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

/**
 * Clear Session Cookie on NextResponse.
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Fetch or seed default user record from database.
 */
export async function getOrCreateUser(email: string, name?: string, role?: string) {
  let user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name || email.split('@')[0],
        role: role || (email.includes('admin') ? 'ADMIN' : 'MARKETING_MANAGER'),
      },
    });
  }

  return user;
}
