import { describe, it, expect } from 'vitest';
import { creativeFatigueDetector } from '../../src/lib/analytics/creative-fatigue-detector';
import { localizationAgent } from '../../src/lib/ai/localization-agent';
import { communityAgent } from '../../src/lib/ai/community-agent';
import { videoAgent } from '../../src/lib/ai/video-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Creative Fatigue, Localization, Community Escalation & Video Package', () => {
  it('should detect string similarity and repeated hook fatigue', async () => {
    const sim = creativeFatigueDetector.computeStringSimilarity(
      'Why single LLM prompts fail enterprise brand safety tests',
      'Why single LLM prompts fail corporate brand safety tests'
    );
    expect(sim).toBeGreaterThan(0.70);
  });

  it('should preserve source-to-localized lineage in LocalizationAgent', async () => {
    const task = createBaseTask('tenant-default', 'brand_test_1', {
      sourceContentId: 'item_100',
      sourceLocale: 'en-US',
      targetLocale: 'es-ES',
      bodyText: '5 AI Governance Rules for Enterprise SaaS.',
      ctaText: 'Schedule Audit',
      brandPersonality: 'Professional, Technical',
    });

    const res = await localizationAgent.execute(task);
    expect(res.status).toBe('completed');
    expect(res.output?.lineage.sourceContentId).toBe('item_100');
    expect(res.output?.lineage.targetLocale).toBe('es-ES');
  });

  it('should escalate crisis, legal, or security messages in CommunityAgent', async () => {
    const task = createBaseTask('tenant-default', 'brand_test_1', {
      brandId: 'brand_test_1',
      platform: 'linkedin' as const,
      externalMessageId: `ext_msg_${Date.now()}`,
      senderHandle: '@lawyer_john',
      content: 'We are issuing a legal lawsuit for copyright infringement in your latest post.',
    });

    const res = await communityAgent.execute(task);
    expect(res.output?.classification).toBe('CRISIS_RISK');
    expect(res.output?.isEscalated).toBe(true);
  });

  it('should generate valid short-form video package with aspect ratios and captions', async () => {
    const task = createBaseTask('tenant-default', 'brand_test_1', {
      contentItemId: `item_vid_${Date.now()}`,
      topic: 'Multi-Agent AI Governance Strategy',
      targetAudience: 'Enterprise SaaS CTOs',
      ctaText: 'Download Benchmark Report',
    });

    const res = await videoAgent.execute(task);
    expect(res.status).toBe('completed');
    expect(res.output?.aspectRatios).toContain('9:16');
    expect(res.output?.sceneSequence.length).toBeGreaterThan(0);
  });
});
