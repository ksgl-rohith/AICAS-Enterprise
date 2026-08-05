import { describe, it, expect } from 'vitest';
import { seoDiscoveryAgent } from '../../src/lib/ai/seo-discovery-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('SEO & Discovery Agent', () => {
  it('should generate platform-limited hashtags and search keywords', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      contentItemId: 'item_1',
      channel: 'linkedin' as const,
      title: 'Autonomous Social Content OS',
      bodyText: 'Enterprise AI social orchestration platform for corporate marketing leads.',
      industry: 'Technology',
      brandKeywords: ['EnterpriseAI', 'MultiAgent', 'Governance'],
    });

    const res = await seoDiscoveryAgent.execute(task);
    expect(res.output?.hashtags.length).toBeLessThanOrEqual(5);
    expect(res.output?.searchKeywords.length).toBeGreaterThan(0);
  });
});
