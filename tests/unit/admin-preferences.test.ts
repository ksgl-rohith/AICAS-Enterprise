import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { signSessionPayload } from '@/lib/auth';
import { GET, POST } from '@/app/api/settings/preferences/route';

describe('Admin Preferences API & Security Controls', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const adminToken = signSessionPayload({
    userId: 'user-1',
    email: 'admin@aicas.enterprise',
    name: 'Administrator',
    role: 'ADMIN',
  });

  it('GET /api/settings/preferences creates or fetches default user preferences', async () => {
    const mockUser = { id: 'user-1', email: 'admin@aicas.enterprise', role: 'ADMIN' };
    const mockPrefs = {
      id: 'pref-1',
      userId: 'user-1',
      theme: 'system',
      density: 'comfortable',
      allowedAiProvider: 'gemini',
      executionMode: 'mock',
    };

    vi.spyOn(db.user, 'findUnique').mockResolvedValue(mockUser as any);
    vi.spyOn(db.userPreferences, 'findUnique').mockResolvedValue(mockPrefs as any);

    const req = new NextRequest('http://localhost/api/settings/preferences', {
      headers: { cookie: `aicas_session=${adminToken}` },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.allowedAiProvider).toBe('gemini');
    expect(data.executionMode).toBe('mock');
  });

  it('POST /api/settings/preferences validates allowlist provider & models', async () => {
    const mockUser = { id: 'user-1', email: 'admin@aicas.enterprise', role: 'ADMIN' };

    vi.spyOn(db.user, 'findUnique').mockResolvedValue(mockUser as any);

    const invalidReq = new NextRequest('http://localhost/api/settings/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `aicas_session=${adminToken}`,
      },
      body: JSON.stringify({
        allowedAiProvider: 'unapproved_malicious_provider',
      }),
    });

    const response = await POST(invalidReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid preference input values');
  });

  it('POST /api/settings/preferences records ADMIN_PREFERENCES_UPDATED in audit ledger', async () => {
    const mockUser = { id: 'user-1', email: 'admin@aicas.enterprise', role: 'ADMIN' };
    const mockUpdatedPrefs = {
      id: 'pref-1',
      userId: 'user-1',
      theme: 'dark',
      allowedAiProvider: 'gemini',
      executionMode: 'real',
    };

    vi.spyOn(db.user, 'findUnique').mockResolvedValue(mockUser as any);
    vi.spyOn(db.userPreferences, 'upsert').mockResolvedValue(mockUpdatedPrefs as any);
    const auditSpy = vi.spyOn(db.auditEvent, 'create').mockResolvedValue({} as any);

    const validReq = new NextRequest('http://localhost/api/settings/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `aicas_session=${adminToken}`,
      },
      body: JSON.stringify({
        theme: 'dark',
        allowedAiProvider: 'gemini',
        executionMode: 'real',
      }),
    });

    const response = await POST(validReq);
    expect(response.status).toBe(200);
    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'ADMIN_PREFERENCES_UPDATED',
        }),
      })
    );
  });
});
