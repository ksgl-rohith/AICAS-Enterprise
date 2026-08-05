import { describe, it, expect } from 'vitest';
import { factVerificationAgent } from '../../src/lib/ai/fact-verification-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Fact Verification Agent', () => {
  it('should block unsupported statistical claims when zero evidence is provided', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      contentItemId: 'item_1',
      textToVerify: 'Our product increases sales by 450% guaranteed.',
      availableEvidence: [],
    });

    const res = await factVerificationAgent.execute(task);
    expect(res.output?.hasUnsupportedHighRiskClaim).toBe(true);
    expect(res.output?.status).toBe('blocked');
  });

  it('should pass claims backed by grounded RAG evidence', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      contentItemId: 'item_2',
      textToVerify: 'Enterprise multi-agent governance platform reduces manual compliance overhead.',
      availableEvidence: [
        {
          evidenceId: 'ev_1',
          sourceId: 'doc_1',
          sourceTitle: 'Whitepaper.pdf',
          sourceType: 'document' as const,
          retrievedExcerpt: 'Enterprise multi-agent governance platform reduces manual compliance overhead for corporate teams.',
          retrievalDate: new Date().toISOString(),
          trustLevel: 'VERIFIED_INTERNAL' as const,
          tenantId: 'tenant-1',
          brandId: 'brand-1',
          confidence: 0.95,
        },
      ],
    });

    const res = await factVerificationAgent.execute(task);
    expect(res.output?.status).toBe('passed');
  });
});
