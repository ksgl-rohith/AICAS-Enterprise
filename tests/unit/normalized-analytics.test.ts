import { describe, it, expect } from 'vitest';
import { analyticsIngestionService, NormalizedMetricEvent } from '../../src/lib/analytics/normalized-analytics';

describe('Normalized Analytics Model & Ingestion Engine', () => {
  it('should enforce metric normalization contract and schema fields', async () => {
    const runId = Date.now();
    const event: NormalizedMetricEvent = {
      eventId: `evt_${runId}_1`,
      tenantId: 'tenant-default',
      brandId: 'brand_test_1',
      platform: 'linkedin',
      eventType: 'snapshot',
      occurredAt: new Date().toISOString(),
      metrics: {
        impressions: 5000,
        reach: 4200,
        reactions: 350,
        comments: 45,
        shares: 12,
        saves: 28,
        clicks: 180,
        ctr: 0.036,
        watchTime: 0,
        videoCompletion: 0,
        followerGrowth: 15,
        leads: 8,
        conversions: 3,
        sentiment: 0.85,
        responseTime: 0,
        cpo: 14.5,
      },
    };

    const result = await analyticsIngestionService.ingestMetricEvent(event);
    expect(result.isDuplicate).toBe(false);
    expect(result.event.dedupHash).toBeDefined();
    expect(result.event.platform).toBe('linkedin');
  });

  it('should protect from duplicate snapshots via hash idempotency', async () => {
    const runId = Date.now();
    const timestamp = new Date().toISOString();
    const event: NormalizedMetricEvent = {
      eventId: `evt_dup_${runId}`,
      tenantId: 'tenant-default',
      brandId: 'brand_test_1',
      publicationId: `pub_${runId}`,
      platform: 'linkedin',
      eventType: 'snapshot',
      occurredAt: timestamp,
      metrics: {
        impressions: 1000,
        reach: 800,
        reactions: 50,
        comments: 5,
        shares: 2,
        saves: 3,
        clicks: 30,
        ctr: 0.03,
        watchTime: 0,
        videoCompletion: 0,
        followerGrowth: 0,
        leads: 1,
        conversions: 0,
        sentiment: 0.7,
        responseTime: 0,
        cpo: 0,
      },
    };

    const firstIngest = await analyticsIngestionService.ingestMetricEvent(event);
    expect(firstIngest.isDuplicate).toBe(false);

    const secondIngest = await analyticsIngestionService.ingestMetricEvent(event);
    expect(secondIngest.isDuplicate).toBe(true);
  });

  it('should handle late-arriving metrics and correction event types', async () => {
    const runId = Date.now();
    const lateEvent: NormalizedMetricEvent = {
      eventId: `evt_late_${runId}`,
      tenantId: 'tenant-default',
      brandId: 'brand_test_1',
      platform: 'facebook',
      eventType: 'correction',
      occurredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      metrics: {
        impressions: 12000,
        reach: 10000,
        reactions: 800,
        comments: 90,
        shares: 40,
        saves: 50,
        clicks: 450,
        ctr: 0.0375,
        watchTime: 0,
        videoCompletion: 0,
        followerGrowth: 25,
        leads: 15,
        conversions: 5,
        sentiment: 0.9,
        responseTime: 0,
        cpo: 10.0,
      },
    };

    const result = await analyticsIngestionService.ingestMetricEvent(lateEvent);
    expect(result.isCorrection).toBe(true);
    expect(result.isDuplicate).toBe(false);
  });
});
