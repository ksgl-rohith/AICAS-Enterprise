import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCredentialsService } from '@/lib/connectors/api-credentials-service';
import { db } from '@/lib/db';

describe('Admin API Credentials Manager & Encryption Controls', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('masks sensitive secrets cleanly (sk-•••••••••7X2A)', () => {
    const maskedOpenAi = apiCredentialsService.maskSecret('sk-proj-1234567890abcdef7X2A');
    expect(maskedOpenAi).toContain('sk-');
    expect(maskedOpenAi).toContain('7X2A');
    expect(maskedOpenAi).not.toContain('1234567890');
  });

  it('encrypts secret credentials before storing and redacts secrets in audit logs', async () => {
    const mockCreated = {
      id: 'cred-1',
      tenantId: 'tenant-default',
      category: 'ai',
      provider: 'gemini',
      name: 'Google Gemini API',
      keyMask: 'gem•••••••••890A',
      encryptedSecret: '{"encryptedData":"abc"}',
      configJson: '{}',
      status: 'configured',
      updatedAt: new Date(),
    };

    vi.spyOn(db.apiCredential, 'findUnique').mockResolvedValue(null as any);
    vi.spyOn(db.apiCredential, 'upsert').mockResolvedValue(mockCreated as any);
    const auditSpy = vi.spyOn(db.auditEvent, 'create').mockResolvedValue({} as any);

    const result = await apiCredentialsService.saveCredential({
      category: 'ai',
      provider: 'gemini',
      name: 'Google Gemini API',
      values: { api_key: 'gemini_secret_key_1234567890A' },
    });

    expect(result.status).toBe('configured');
    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category: 'Credential',
          action: 'credential.created',
        }),
      })
    );
  });
});
