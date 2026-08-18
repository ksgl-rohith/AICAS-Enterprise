import { db } from '@/lib/db';

export interface DashboardMetricsSummary {
  activeBrandsCount: number;
  activeCampaignsCount: number;
  pendingApprovalsCount: number;
  totalImpressions: number;
  connectedPlatformsCount: number;
  forecastAccuracyPercentage: number | null;
  experimentsCount: number;
  totalCostUsd: number;
  recentCampaigns: any[];
}

export class DashboardService {
  /**
   * Fetch real database-backed metrics for executive dashboards.
   */
  public async getDashboardMetrics(tenantId: string = 'tenant-default'): Promise<DashboardMetricsSummary> {
    const brandScope = {
      OR: [
        { workspaceId: tenantId },
        { workspaceId: null },
      ],
      isArchived: false,
    };

    const campaignScope = {
      brand: {
        OR: [
          { workspaceId: tenantId },
          { workspaceId: null },
        ],
      },
    };

    const [
      activeBrandsCount,
      activeCampaignsCount,
      pendingApprovalsCount,
      connectedPlatforms,
      configuredCredentials,
      experimentsCount,
      costRecords,
      normalizedEvents,
      evaluatedForecasts,
      recentCampaigns,
    ] = await Promise.all([
      db.brand.count({ where: brandScope }),
      db.campaign.count({ where: campaignScope }),
      db.contentItem.count({
        where: {
          status: { in: ['IN_REVIEW', 'NEEDS_REVISION'] },
          campaign: campaignScope,
        },
      }),
      db.platformConnection.count({
        where: {
          status: 'CONNECTED',
          brand: brandScope,
        },
      }),
      db.apiCredential.count({ where: { tenantId, status: 'configured' } }),
      db.experiment.count({ where: { tenantId } }),
      db.costUsageRecord.findMany({ where: { tenantId }, select: { estimatedCostUsd: true } }),
      db.normalizedMetricEvent.findMany({ where: { tenantId }, select: { metricsJson: true } }),
      db.performanceForecast.findMany({ where: { tenantId, actualValue: { not: null } }, select: { mape: true } }),
      db.campaign.findMany({
        where: campaignScope,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { _count: { select: { contentItems: true } } },
      }),
    ]);

    // Calculate sum of real impressions from normalized events
    let totalImpressions = 0;
    for (const ev of normalizedEvents) {
      try {
        const metrics = JSON.parse(ev.metricsJson);
        totalImpressions += metrics.impressions || metrics.reach || 0;
      } catch {
        // ignore
      }
    }

    // Calculate sum of cost
    const totalCostUsd = costRecords.reduce((acc, r) => acc + (r.estimatedCostUsd || 0), 0);

    // Calculate forecast accuracy percentage
    let forecastAccuracyPercentage: number | null = null;
    if (evaluatedForecasts.length > 0) {
      const validMapes = evaluatedForecasts.filter((f) => f.mape !== null).map((f) => f.mape!);
      if (validMapes.length > 0) {
        const avgMape = validMapes.reduce((a, b) => a + b, 0) / validMapes.length;
        forecastAccuracyPercentage = Math.max(0, Math.round(100 - avgMape));
      }
    }

    return {
      activeBrandsCount,
      activeCampaignsCount,
      pendingApprovalsCount,
      totalImpressions,
      connectedPlatformsCount: connectedPlatforms + configuredCredentials,
      forecastAccuracyPercentage,
      experimentsCount,
      totalCostUsd,
      recentCampaigns,
    };
  }
}

export const dashboardService = new DashboardService();
