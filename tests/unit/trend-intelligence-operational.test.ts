import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { trendSignalIngestion } from '@/lib/ai/trend-signal-ingestion';
import { trendIntelligenceAgent } from '@/lib/ai/trend-intelligence-agent';

describe('Operational Trend Intelligence & Signal Freshness', () => {
  it('ingests DB trend signals and determines freshness state LIVE', async () => {
    const signal = await db.trendSignal.create({
      data: {
        topic: 'AI Brand Safety Regulatory Compliance 2026',
        category: 'Corporate Governance',
        summary: 'New guidelines require verifiable provenance for automated AI publishing.',
        source: 'Global Regulatory Feed',
        relevanceScore: 0.95,
        freshnessScore: 0.98,
        opportunityScore: 0.92,
      },
    });

    const pkg = await trendSignalIngestion.getActiveSignals('Enterprise Software');

    expect(pkg.signals.length).toBeGreaterThan(0);
    expect(pkg.freshnessState).toBe('LIVE');
  });

  it('executes trend intelligence agent and produces ranked opportunities with freshness metadata', async () => {
    const rawSignal = {
      id: 'sig_test_1',
      title: 'AI Brand Safety Regulatory Compliance 2026',
      summary: 'New guidelines require verifiable provenance for automated AI publishing.',
      source: 'Global Regulatory Feed',
      sourceType: 'news' as const,
      publishedAt: new Date().toISOString(),
      keywords: ['Corporate Governance', 'Enterprise Software', 'AI'],
    };

    const result = await trendIntelligenceAgent.execute({
      taskId: 'task_trend_op_1',
      tenantId: 'tenant-default',
      brandId: 'brand-default',
      input: {
        signals: [rawSignal],
        industry: 'Enterprise Software',
        brandKeywords: ['AI', 'Safety', 'Governance'],
        targetAudience: 'CTOs & Chief Digital Officers',
        minOpportunityScore: 0.4,
      },
    });

    expect(result.status).toBe('completed');
    expect(result.output?.opportunities.length).toBe(1);
    expect(result.output?.opportunities[0].opportunityScore).toBeGreaterThan(0.5);
    expect(result.output?.freshnessState).toBe('LIVE');
  });
});
