import { db } from '@/lib/db';
import { createHash } from 'crypto';
import { z } from 'zod';

export const PlatformMetricsSchema = z.object({
  impressions: z.number().default(0),
  reach: z.number().default(0),
  reactions: z.number().default(0),
  comments: z.number().default(0),
  shares: z.number().default(0),
  saves: z.number().default(0),
  clicks: z.number().default(0),
  ctr: z.number().default(0),
  watchTime: z.number().default(0), // in seconds
  videoCompletion: z.number().default(0), // fraction 0.0 - 1.0
  followerGrowth: z.number().default(0),
  leads: z.number().default(0),
  conversions: z.number().default(0),
  sentiment: z.number().default(0), // score -1.0 to 1.0
  responseTime: z.number().default(0), // in seconds
  cpo: z.number().default(0), // cost per outcome USD
});

export type PlatformMetrics = z.infer<typeof PlatformMetricsSchema>;

export const NormalizedMetricEventSchema = z.object({
  eventId: z.string(),
  tenantId: z.string().default('tenant-default'),
  brandId: z.string(),
  campaignId: z.string().optional(),
  contentId: z.string().optional(),
  contentVersionId: z.string().optional(),
  publicationId: z.string().optional(),
  experimentId: z.string().optional(),
  platform: z.string(),
  eventType: z.enum(['snapshot', 'conversion', 'interaction', 'correction']).default('snapshot'),
  occurredAt: z.union([z.string(), z.date()]),
  receivedAt: z.union([z.string(), z.date()]).optional(),
  metrics: PlatformMetricsSchema,
  dimensions: z.record(z.any()).optional(),
  source: z.string().default('PLATFORM_API'),
  schemaVersion: z.string().default('v1.0'),
  rawPayload: z.any().optional(),
});

export type NormalizedMetricEvent = z.infer<typeof NormalizedMetricEventSchema>;

export class AnalyticsIngestionService {
  private static instance: AnalyticsIngestionService;

  private constructor() {}

  public static getInstance(): AnalyticsIngestionService {
    if (!AnalyticsIngestionService.instance) {
      AnalyticsIngestionService.instance = new AnalyticsIngestionService();
    }
    return AnalyticsIngestionService.instance;
  }

  public computeDedupHash(event: NormalizedMetricEvent): string {
    const raw = `${event.tenantId}:${event.brandId}:${event.publicationId || ''}:${event.platform}:${event.eventType}:${new Date(event.occurredAt).toISOString()}:${JSON.stringify(event.metrics)}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  public async ingestMetricEvent(rawEvent: NormalizedMetricEvent): Promise<{
    event: any;
    isDuplicate: boolean;
    isCorrection: boolean;
  }> {
    const validated = NormalizedMetricEventSchema.parse(rawEvent);
    const occurredAt = new Date(validated.occurredAt);
    const receivedAt = validated.receivedAt ? new Date(validated.receivedAt) : new Date();
    const dedupHash = this.computeDedupHash(validated);

    // 1. Idempotency Check (Duplicate Snapshot Protection)
    const existing = await db.normalizedMetricEvent.findUnique({
      where: { dedupHash },
    });

    if (existing) {
      return {
        event: existing,
        isDuplicate: true,
        isCorrection: false,
      };
    }

    // 2. Correction Handling
    const isCorrection = validated.eventType === 'correction';

    // 3. Persist Event
    const created = await db.normalizedMetricEvent.create({
      data: {
        eventId: validated.eventId,
        tenantId: validated.tenantId,
        brandId: validated.brandId,
        campaignId: validated.campaignId || null,
        contentId: validated.contentId || null,
        contentVersionId: validated.contentVersionId || null,
        publicationId: validated.publicationId || null,
        experimentId: validated.experimentId || null,
        platform: validated.platform,
        eventType: validated.eventType,
        occurredAt,
        receivedAt,
        metricsJson: JSON.stringify(validated.metrics),
        dimensionsJson: validated.dimensions ? JSON.stringify(validated.dimensions) : null,
        source: validated.source,
        schemaVersion: validated.schemaVersion,
        rawPayloadJson: validated.rawPayload ? JSON.stringify(validated.rawPayload) : null,
        dedupHash,
      },
    });

    return {
      event: created,
      isDuplicate: false,
      isCorrection,
    };
  }

  public async getTenantMetrics(tenantId: string, brandId?: string) {
    const where: any = { tenantId };
    if (brandId) where.brandId = brandId;

    const events = await db.normalizedMetricEvent.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: 100,
    });

    return events.map((e) => ({
      ...e,
      metrics: JSON.parse(e.metricsJson) as PlatformMetrics,
      dimensions: e.dimensionsJson ? JSON.parse(e.dimensionsJson) : {},
    }));
  }

  public async replayEvents(tenantId: string): Promise<number> {
    const events = await db.normalizedMetricEvent.findMany({
      where: { tenantId },
      orderBy: { occurredAt: 'asc' },
    });
    // Simulates deterministic re-aggregation
    return events.length;
  }
}

export const analyticsIngestionService = AnalyticsIngestionService.getInstance();
