import { describe, it, expect } from 'vitest';
import { reviewAgent } from '../../src/lib/ai/review-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';
import { db } from '../../src/lib/db';

describe('Quality Council Coordinator (review-agent.ts)', () => {
  it('should aggregate independent governance reviewers into a unified decision', async () => {
    // Find or create test brand & campaign & item
    let brand = await db.brand.findFirst();
    if (!brand) {
      const user = await db.user.create({
        data: { email: 'council_test@aicas.ai', name: 'Council User' },
      });
      brand = await db.brand.create({
        data: {
          userId: user.id,
          name: 'Test Brand',
          industry: 'Technology',
          description: 'Desc',
          products: 'AI',
          targetAudience: 'Execs',
          personality: 'Bold',
          tone: 'Authoritative',
          preferredVocabulary: 'AI, Governance',
          prohibitedPhrases: 'cheap, hack',
          requiredDisclaimers: 'Results may vary.',
          defaultCTA: 'Learn More',
        },
      });
    }

    const campaign = await db.campaign.create({
      data: {
        brandId: brand.id,
        name: 'Council Test Campaign',
        objective: 'awareness',
        productOrTopic: 'Multi-Agent Governance',
        description: 'Test Campaign',
        targetAudience: 'Execs',
        offerCTA: 'Learn More',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        channels: 'linkedin',
      },
    });

    const item = await db.contentItem.create({
      data: {
        campaignId: campaign.id,
        title: 'Multi-Agent Governance Test Post',
        coreIdea: 'Testing Quality Council aggregation',
        targetAudience: 'Execs',
        contentPillar: 'Innovation',
        format: 'text_post',
        defaultCTA: 'Learn More',
      },
    });

    await db.contentVariant.create({
      data: {
        contentItemId: item.id,
        channel: 'linkedin',
        hook: 'Revolutionize your enterprise AI social workflow.',
        bodyText: 'Our multi-agent governance OS ensures 100% brand fidelity and compliance. Results may vary.',
        ctaText: 'Learn More',
      },
    });

    const task = createBaseTask('tenant-1', brand.id, {
      contentItemId: item.id,
      brandId: brand.id,
    });

    const res = await reviewAgent.execute(task);
    expect(res.output?.qualityCouncilDetails).toBeDefined();
    expect(res.output?.brandScore).toBeGreaterThan(0);
    expect(res.output?.complianceScore).toBeGreaterThan(0);
  });
});
