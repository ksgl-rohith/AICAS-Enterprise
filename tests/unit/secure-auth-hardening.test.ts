import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  signSessionPayload,
  verifySessionToken,
} from '@/lib/auth';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as signupHandler } from '@/app/api/auth/signup/route';
import { GET as meHandler } from '@/app/api/auth/me/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { middleware } from '@/middleware';

describe('Production-Hardened Authentication & Security Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(db.auditEvent, 'create').mockResolvedValue({ id: 'evt_mock' } as any);
  });

  describe('Cryptographic Password Hashing & Verification', () => {
    it('generates unique salted hashes for the same password', () => {
      const password = 'SuperSecurePassword@2026';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toContain(':');
      expect(hash2).toContain(':');
    });

    it('verifies matching password successfully', () => {
      const password = 'EnterprisePassword#123';
      const storedHash = hashPassword(password);

      expect(verifyPassword(password, storedHash)).toBe(true);
    });

    it('rejects incorrect password with timing-safe comparison', () => {
      const password = 'CorrectPassword123';
      const storedHash = hashPassword(password);

      expect(verifyPassword('WrongPassword123', storedHash)).toBe(false);
      expect(verifyPassword('', storedHash)).toBe(false);
      expect(verifyPassword(password, 'invalid-malformed-hash')).toBe(false);
      expect(verifyPassword(password, null as any)).toBe(false);
    });
  });

  describe('Session Token Signing & Verification', () => {
    it('signs and verifies valid session tokens', () => {
      const token = signSessionPayload({
        userId: 'usr-123',
        email: 'engineer@aicas.ai',
        name: 'Lead Engineer',
        role: 'MARKETING_MANAGER',
      });

      const session = verifySessionToken(token);
      expect(session).not.toBeNull();
      expect(session?.userId).toBe('usr-123');
      expect(session?.email).toBe('engineer@aicas.ai');
      expect(session?.role).toBe('MARKETING_MANAGER');
    });

    it('rejects tampered or forged session tokens', () => {
      const token = signSessionPayload({
        userId: 'usr-123',
        email: 'user@aicas.ai',
        name: 'User',
        role: 'USER',
      });

      const [data, signature] = token.split('.');
      const tamperedData = Buffer.from(
        JSON.stringify({ userId: 'usr-123', email: 'admin@aicas.ai', name: 'User', role: 'ADMIN', exp: Date.now() + 100000 })
      ).toString('base64url');

      const forgedToken = `${tamperedData}.${signature}`;
      expect(verifySessionToken(forgedToken)).toBeNull();
    });
  });

  describe('User Registration (POST /api/auth/signup)', () => {
    it('validates minimum password length (min 8 chars)', async () => {
      const req = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@enterprise.com',
          password: 'short',
        }),
      });

      const res = await signupHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('at least 8 characters');
    });

    it('prevents role elevation and creates user with standard role', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(null);
      const userCreateSpy = vi.fn().mockResolvedValue({
        id: 'usr-new-1',
        name: 'Jane Marketer',
        email: 'jane@marketing.corp',
        role: 'MARKETING_MANAGER',
        status: 'ACTIVE',
        passwordHash: 'salt:hash',
      });
      const wsCreateSpy = vi.fn().mockResolvedValue({
        id: 'ws-new-1',
        name: "Jane's Organization",
        code: 'JANE-WS',
      });
      const memCreateSpy = vi.fn().mockResolvedValue({
        id: 'mem-1',
        workspaceId: 'ws-new-1',
        userId: 'usr-new-1',
        role: 'WORKSPACE_OWNER',
      });
      const prefCreateSpy = vi.fn().mockResolvedValue({
        id: 'pref-1',
        userId: 'usr-new-1',
      });

      vi.spyOn(db, '$transaction').mockImplementation(async (cb: any) => {
        return cb({
          user: { create: userCreateSpy },
          workspace: { create: wsCreateSpy },
          workspaceMembership: { create: memCreateSpy },
          userPreferences: { create: prefCreateSpy },
        });
      });

      const req = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Marketer',
          email: 'jane@marketing.corp',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!',
          role: 'ADMIN', // Attacker attempt to self-elevate
        }),
      });

      const res = await signupHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(userCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'MARKETING_MANAGER', // Enforced server-side
          }),
        })
      );
    });

    it('rejects duplicate email registration with 409 Conflict', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue({ id: 'existing-1', email: 'existing@corp.com' } as any);

      const req = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Existing User',
          email: 'existing@corp.com',
          password: 'ValidPassword123!',
        }),
      });

      const res = await signupHandler(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error).toContain('already registered');
    });
  });

  describe('User Login (POST /api/auth/login)', () => {
    it('returns 401 Unauthorized for unknown user without revealing existence', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@enterprise.com',
          password: 'AnyPassword123',
        }),
      });

      const res = await loginHandler(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe('Invalid email or password.');
    });

    it('returns 401 Unauthorized for wrong password against hashed password', async () => {
      const realPassword = 'RealSecretPassword@2026';
      const realHash = hashPassword(realPassword);

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'usr-real-1',
        email: 'real@enterprise.com',
        name: 'Real User',
        role: 'MARKETING_MANAGER',
        status: 'ACTIVE',
        passwordHash: realHash,
      } as any);

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'real@enterprise.com',
          password: 'WrongPasswordGuess',
        }),
      });

      const res = await loginHandler(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe('Invalid email or password.');
    });

    it('succeeds for valid password and sets secure session cookie', async () => {
      const realPassword = 'RealSecretPassword@2026';
      const realHash = hashPassword(realPassword);

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'usr-real-1',
        email: 'real@enterprise.com',
        name: 'Real User',
        role: 'MARKETING_MANAGER',
        status: 'ACTIVE',
        passwordHash: realHash,
      } as any);

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'real@enterprise.com',
          password: realPassword,
        }),
      });

      const res = await loginHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('real@enterprise.com');
      const setCookieHeader = res.headers.get('set-cookie');
      expect(setCookieHeader).toContain('aicas_session=');
      expect(setCookieHeader).toContain('HttpOnly');
    });

    it('rejects disabled accounts with 403 Forbidden', async () => {
      const realPassword = 'RealSecretPassword@2026';
      const realHash = hashPassword(realPassword);

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'usr-disabled-1',
        email: 'disabled@enterprise.com',
        name: 'Disabled User',
        role: 'MARKETING_MANAGER',
        status: 'SUSPENDED',
        passwordHash: realHash,
      } as any);

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'disabled@enterprise.com',
          password: realPassword,
        }),
      });

      const res = await loginHandler(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain('disabled');
    });
  });

  describe('Session Retrieval & Logout (GET /api/auth/me & POST /api/auth/logout)', () => {
    it('returns user data for valid session cookie', async () => {
      const token = signSessionPayload({
        userId: 'usr-me-1',
        email: 'me@enterprise.com',
        name: 'Me User',
        role: 'MARKETING_MANAGER',
      });

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'usr-me-1',
        email: 'me@enterprise.com',
        name: 'Me User',
        role: 'MARKETING_MANAGER',
        status: 'ACTIVE',
      } as any);

      const req = new NextRequest('http://localhost/api/auth/me', {
        headers: { cookie: `aicas_session=${token}` },
      });

      const res = await meHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.authenticated).toBe(true);
      expect(data.user.email).toBe('me@enterprise.com');
    });

    it('returns 401 for unauthenticated request on /api/auth/me', async () => {
      const req = new NextRequest('http://localhost/api/auth/me');
      const res = await meHandler(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.authenticated).toBe(false);
    });

    it('clears session cookie on logout', async () => {
      const token = signSessionPayload({
        userId: 'usr-logout-1',
        email: 'logout@enterprise.com',
        name: 'Logout User',
        role: 'MARKETING_MANAGER',
      });

      const req = new NextRequest('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { cookie: `aicas_session=${token}` },
      });

      const res = await logoutHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain('aicas_session=;');
    });
  });

  describe('Edge Middleware RBAC & Guard', () => {
    it('redirects non-admin user trying to access /admin to /dashboard', async () => {
      const userToken = signSessionPayload({
        userId: 'usr-std-1',
        email: 'standard@enterprise.com',
        name: 'Standard User',
        role: 'MARKETING_MANAGER',
      });

      const req = new NextRequest('http://localhost:3000/admin/settings', {
        headers: { cookie: `aicas_session=${userToken}` },
      });

      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });

    it('allows admin user to access /admin route', async () => {
      const adminToken = signSessionPayload({
        userId: 'usr-admin-1',
        email: 'admin@enterprise.com',
        name: 'Admin User',
        role: 'ADMIN',
      });

      const req = new NextRequest('http://localhost:3000/admin/settings', {
        headers: { cookie: `aicas_session=${adminToken}` },
      });

      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });
});
