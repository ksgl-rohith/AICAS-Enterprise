import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export const SESSION_COOKIE_NAME = 'aicas_session';
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
 * Hash password securely using PBKDF2 with unique cryptographic salt.
 * Returns salt:hash format.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored salt:hash string using timing-safe comparison.
 */
export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!password || !storedHash) return false;
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, expectedHash] = parts;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    const computedBuffer = Buffer.from(computedHash, 'hex');
    if (expectedBuffer.length !== computedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, computedBuffer);
  } catch {
    return false;
  }
}

/**
 * Sign session payload to token string.
 */
export function signSessionPayload(
  payload: Omit<UserSessionPayload, 'createdAt' | 'exp'>,
  rememberMe: boolean = false
): string {
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
const CANDIDATE_SECRETS = Array.from(
  new Set(
    [
      process.env.SESSION_SECRET,
      '54c9fb727bb0342698817079b67200c63f45f7da94cfa39d911aa1a2a40615e5',
      'aicas_enterprise_secure_session_secret_key_32bytes',
      'aicas_super_secret_state_token_key_12345',
    ].filter(Boolean) as string[]
  )
);

/**
 * Verify and decode session token string.
 */
export function verifySessionToken(token: string | undefined | null): UserSessionPayload | null {
  if (!token) return null;
  try {
    let cleanToken = token.trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }
    const parts = cleanToken.split('.');
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;

    let isValid = false;
    const signatureBuffer = Buffer.from(signature, 'hex');

    for (const secret of CANDIDATE_SECRETS) {
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(base64Data)
        .digest('hex');
      const expectedBuffer = Buffer.from(expectedSig, 'hex');
      if (expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
        isValid = true;
        break;
      }
    }

    if (!isValid) return null;

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
 * Find user by email strictly from database.
 */
export async function findUserByEmail(email: string) {
  if (!email) return null;
  return await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}

/**
 * Find user by ID strictly from database.
 */
export async function findUserById(id: string) {
  if (!id) return null;
  return await db.user.findUnique({
    where: { id },
  });
}

/**
 * Create a new user with standard role and hashed password.
 */
export async function createUserAccount(params: {
  email: string;
  name: string;
  password?: string;
  role?: string;
}) {
  const normalizedEmail = params.email.toLowerCase().trim();
  const passwordHash = params.password ? hashPassword(params.password) : null;

  return await db.user.create({
    data: {
      email: normalizedEmail,
      name: params.name || normalizedEmail.split('@')[0],
      role: params.role || 'MARKETING_MANAGER',
      passwordHash,
      status: 'ACTIVE',
      preferences: {
        create: {
          theme: 'system',
          density: 'comfortable',
          sidebarDefault: 'expanded',
        },
      },
    },
  });
}
