import { describe, it, expect } from 'vitest';
import { trendIntelligenceAgent, calculateTrendScores } from '../../src/lib/ai/trend-intelligence-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Trend Intelligence Agent', () => {
  it('should calculate deterministic trend scores and classify categories', () => {
    const signal = {
      id: 'sig_test_1',
      title: 'Enterprise AI Governance Growth',
      summary: 'AI Security and compliance trends in enterprise B2B software',
      source: 'Tech News',
      sourceType: 'news' as const,
      publishedAt: new Date().toISOString(),
      keywords: ['AI', 'Governance'],
    };

    const opp = calculateTrendScores(signal, ['AI', 'Governance'], 'Technology', 0.3);
    expect(opp).not.toBeNull();
    expect(opp?.opportunityScore).toBeGreaterThan(0.4);
    expect(opp?.category).toBe('time_sensitive');
  });

  it('should execute trend intelligence agent and deduplicate signals', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      signals: [
        {
          id: 'sig_1',
          title: 'Duplicate AI Trends',
          summary: 'Summary 1',
          source: 'News A',
          sourceType: 'news' as const,
          publishedAt: new Date().toISOString(),
          keywords: ['AI'],
        },
        {
          id: 'sig_2',
          title: 'Duplicate AI Trends',
          summary: 'Summary 2',
          source: 'News B',
          sourceType: 'news' as const,
          publishedAt: new Date().toISOString(),
          keywords: ['AI'],
        },
      ],
      industry: 'Technology',
      brandKeywords: ['AI'],
      targetAudience: 'Executives',
      minOpportunityScore: 0.2,
    });

    const res = await trendIntelligenceAgent.execute(task);
    expect(res.output?.signalsProcessed).toBe(2);
    expect(res.output?.clustersIdentified).toBe(1);
  });
});
