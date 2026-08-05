import { describe, it, expect } from 'vitest';
import { complianceAgent } from '../../src/lib/ai/compliance-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Compliance Agent', () => {
  it('should detect prohibited phrases and missing disclaimers', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      contentItemId: 'item_1',
      channel: 'linkedin' as const,
      text: 'Try our cheap guaranteed viral hack!',
      prohibitedPhrases: ['cheap', 'guaranteed viral'],
      requiredDisclaimers: ['Results may vary.'],
    });

    const res = await complianceAgent.execute(task);
    expect(res.output?.prohibitedPhrasesFound).toContain('cheap');
    expect(res.output?.status).toBe('revise');
  });

  it('should trigger hard block for secret key leakage', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      contentItemId: 'item_2',
      channel: 'linkedin' as const,
      text: 'Here is our production API Key: sk-1234567890abcdef1234567890abcdef12',
      prohibitedPhrases: [],
      requiredDisclaimers: [],
    });

    const res = await complianceAgent.execute(task);
    expect(res.output?.deterministicHardBlock).toBe(true);
    expect(res.output?.status).toBe('block');
  });
});
