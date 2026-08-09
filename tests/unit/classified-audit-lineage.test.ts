import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from '@/lib/services/audit-service';
import { db } from '@/lib/db';

describe('Classified System Audit & Automated Secret Redaction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('redacts sensitive keys (passwords, tokens, secrets) from metadata before creating audit event', async () => {
    const createSpy = vi.spyOn(db.auditEvent, 'create').mockResolvedValue({ id: 'evt-1' } as any);

    await auditService.recordEvent({
      category: 'Credential',
      action: 'credential.created',
      details: 'Created Telegram Bot Credential',
      metadata: {
        provider: 'telegram',
        bot_token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chat_id: '@mychannel',
      },
    });

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category: 'Credential',
          metadataJson: expect.stringContaining('[REDACTED_SECRET]'),
        }),
      })
    );
  });
});
