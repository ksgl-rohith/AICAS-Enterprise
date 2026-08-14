import { describe, it, expect } from 'vitest';
import { orchestratorAgent } from '../../src/lib/ai/orchestrator-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';
import { db } from '../../src/lib/db';

describe('Phase 1 Pipeline End-to-End Integration', () => {
  it('should execute full Phase 1 pipeline with strategy, trend intelligence, content planning, and Quality Council governance', async () => {
    let brand = await db.brand.findFirst();
    if (!brand) {
      const user = await db.user.create({
        data: { email: 'pipeline_user@aicas.ai', name: 'Pipeline User' },
      });
      brand = await db.brand.create({
        data: {
          userId: user.id,
          name: 'ApexAI Enterprise',
          industry: 'Enterprise Software',
          description: 'AI Social Operating System',
          products: 'AICAS Enterprise',
          targetAudience: 'CMOs',
          personality: 'Authoritative',
          tone: 'Professional',
          preferredVocabulary: 'Governance, Multi-Agent',
          prohibitedPhrases: 'cheap, hack',
          requiredDisclaimers: 'Results based on benchmark data.',
          defaultCTA: 'Request Demo',
        },
      });
    }

    const campaign = await db.campaign.create({
      data: {
        brandId: brand.id,
        name: 'Phase 1 Integration Campaign',
        objective: 'awareness',
        productOrTopic: 'Multi-Agent Governance OS',
        description: 'End-to-end integration test',
        targetAudience: 'CMOs and VP Marketing',
        offerCTA: 'Request Demo',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        channels: 'linkedin,facebook',
      },
    });

    const task = createBaseTask('tenant-enterprise-001', brand.id, {
      campaignId: campaign.id,
      brandId: brand.id,
      maxRevisions: 2,
    });

    const res = await orchestratorAgent.executePipeline(task);
    expect(res.output?.campaignId).toBe(campaign.id);
    expect(res.output?.stepsExecuted.length).toBeGreaterThanOrEqual(5);
    expect(res.output?.trendIntelligence).toBeDefined();
    expect(res.output?.contentPlan).toBeDefined();
  }, 60000);
});
