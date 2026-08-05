import { describe, it, expect } from 'vitest';
import { brandCriticAgent } from '../../src/lib/ai/brand-critic-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Brand Critic Agent', () => {
  it('should calculate Brand DNA score and suggest revisions', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      contentItemId: 'item_1',
      headline: 'New Launch',
      bodyText: 'We are excited to launch our enterprise product.',
      brandName: 'ApexAI',
      personality: 'Innovative',
      tone: 'Authoritative',
      preferredVocabulary: ['Autonomous AI', 'Governance'],
      targetAudience: 'CMOs',
    });

    const res = await brandCriticAgent.execute(task);
    expect(res.output?.brandDnaScore).toBeDefined();
    expect(res.output?.deviations.length).toBeGreaterThan(0);
  });
});
