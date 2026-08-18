import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandIdParam = searchParams.get('brandId');
    const requestedWs = searchParams.get('workspaceId') || searchParams.get('tenantId');
    const filterMode = searchParams.get('mode') || 'all'; // 'real', 'simulated', 'all'

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    let whereClause: any = {
      publishingMode: filterMode === 'real' ? 'live' : filterMode === 'simulated' ? 'simulated' : undefined,
    };

    if (brandIdParam) {
      const brand = await db.brand.findUnique({
        where: { id: brandIdParam },
        select: { id: true, workspaceId: true, userId: true },
      });

      if (!brand) {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }

      const isAuthorized =
        authResult.isAdmin ||
        brand.workspaceId === authResult.workspaceId ||
        brand.userId === authResult.userId;

      if (!isAuthorized) {
        throw new WorkspaceAuthError('Forbidden: Access denied to analytics for brand in another workspace', 403);
      }

      whereClause.contentItem = { campaign: { brandId: brandIdParam } };
    } else {
      whereClause.contentItem = {
        campaign: {
          brand: {
            OR: [
              { workspaceId: authResult.workspaceId },
              { userId: authResult.userId, workspaceId: null },
            ],
          },
        },
      };
    }

    const publications = await db.publication.findMany({
      where: whereClause,
      include: {
        contentItem: true,
        metricsSnapshots: {
          orderBy: { snapshotDate: 'desc' },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    // Aggregate overall metrics
    let totalImpressions = 0;
    let totalReach = 0;
    let totalEngagements = 0;
    let totalClicks = 0;
    let totalSaves = 0;
    let totalShares = 0;
    let totalConversions = 0;

    const channelBreakdown: Record<string, { impressions: number; engagements: number; clicks: number }> = {
      linkedin: { impressions: 0, engagements: 0, clicks: 0 },
      facebook: { impressions: 0, engagements: 0, clicks: 0 },
      instagram: { impressions: 0, engagements: 0, clicks: 0 },
      telegram: { impressions: 0, engagements: 0, clicks: 0 },
    };

    const pillarBreakdown: Record<string, { impressions: number; engagements: number; count: number }> = {};

    for (const pub of publications) {
      const latestMetric = pub.metricsSnapshots[0];
      if (latestMetric) {
        totalImpressions += latestMetric.impressions;
        totalReach += latestMetric.reach;
        totalEngagements += latestMetric.engagements;
        totalClicks += latestMetric.clicks;
        totalSaves += latestMetric.saves;
        totalShares += latestMetric.shares;
        totalConversions += latestMetric.conversions;

        const ch = pub.channel.toLowerCase();
        if (channelBreakdown[ch]) {
          channelBreakdown[ch].impressions += latestMetric.impressions;
          channelBreakdown[ch].engagements += latestMetric.engagements;
          channelBreakdown[ch].clicks += latestMetric.clicks;
        }

        const pillar = pub.contentItem.contentPillar || 'General';
        if (!pillarBreakdown[pillar]) {
          pillarBreakdown[pillar] = { impressions: 0, engagements: 0, count: 0 };
        }
        pillarBreakdown[pillar].impressions += latestMetric.impressions;
        pillarBreakdown[pillar].engagements += latestMetric.engagements;
        pillarBreakdown[pillar].count += 1;
      }
    }

    const avgEngagementRate = totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(2) : '0.00';
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      summary: {
        totalPublications: publications.length,
        totalImpressions,
        totalReach,
        totalEngagements,
        totalClicks,
        totalSaves,
        totalShares,
        totalConversions,
        avgEngagementRate: parseFloat(avgEngagementRate),
        avgCTR: parseFloat(avgCTR),
      },
      channelBreakdown,
      pillarBreakdown,
      publications,
    });
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}

