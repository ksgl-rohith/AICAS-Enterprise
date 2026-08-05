import { describe, it, expect } from 'vitest';
import { publicationLedger } from '../../src/lib/publishing/publication-ledger';

describe('Publication Ledger & Idempotency', () => {
  it('should generate consistent idempotency keys and prevent duplicates', async () => {
    const params = {
      tenantId: 'tenant-1',
      campaignId: 'camp-1',
      contentItemId: 'item-1',
      contentVariantId: 'var-1',
      platform: 'linkedin' as const,
      intendedSchedule: new Date(),
      bodyText: 'Test post body',
    };

    const key1 = publicationLedger.generateIdempotencyKey(params);
    const key2 = publicationLedger.generateIdempotencyKey(params);
    expect(key1).toBe(key2);

    const entry1 = await publicationLedger.getOrCreateEntry(params);
    const entry2 = await publicationLedger.getOrCreateEntry(params);
    expect(entry1.id).toBe(entry2.id);
  });
});
