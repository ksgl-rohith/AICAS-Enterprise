import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError } from '@/lib/workspace-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedWs = searchParams.get('workspaceId') || searchParams.get('tenantId');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const isLineage = searchParams.get('lineage') === 'true';

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    const where: any = {};
    if (!authResult.isAdmin) {
      where.OR = [
        { tenantId: authResult.workspaceId },
        { userId: authResult.userId },
      ];
    } else if (requestedWs) {
      where.tenantId = authResult.workspaceId;
    }

    if (category && category !== 'All') where.category = category;
    if (severity && severity !== 'All') where.severity = severity;

    const events = await db.auditEvent.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } },
        brand: { select: { name: true } },
        campaign: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (isLineage) {
      const tenantFilter = authResult.isAdmin && !requestedWs
        ? {}
        : { brand: { OR: [{ workspaceId: authResult.workspaceId }, { userId: authResult.userId, workspaceId: null }] } };

      const campaignFilter = authResult.isAdmin && !requestedWs
        ? {}
        : { campaign: { brand: { OR: [{ workspaceId: authResult.workspaceId }, { userId: authResult.userId, workspaceId: null }] } } };

      // Build forward & backward artifact lineage chain scoped to authorized workspace
      const lineageChain = [
        { step: '01. Brand Knowledge Source', category: 'Brand', count: await db.ingestionSource.count({ where: tenantFilter as any }) },
        { step: '02. RAG Knowledge Vector Index', category: 'Knowledge / RAG', count: await db.knowledgeChunk.count({ where: tenantFilter as any }) },
        { step: '03. Campaign Strategy & Pillaring', category: 'Campaign', count: await db.campaignStrategy.count({ where: campaignFilter as any }) },
        { step: '04. Multi-Agent Draft Generation', category: 'Content', count: await db.contentItem.count({ where: campaignFilter as any }) },
        { step: '05. Quality Council Compliance Review', category: 'Approval', count: await db.reviewResult.count({ where: { contentItem: campaignFilter } as any }) },
        { step: '06. Human Approval Queue', category: 'Approval', count: await db.approvalRequest.count({ where: (authResult.isAdmin && !requestedWs ? {} : { tenantId: authResult.workspaceId }) as any }) },
        { step: '07. Publishing Ledger Execution', category: 'Publishing', count: await db.publicationLedgerEntry.count({ where: (authResult.isAdmin && !requestedWs ? {} : { tenantId: authResult.workspaceId }) as any }) },
        { step: '08. Metrics Ingestion & Analytics', category: 'Analytics', count: await db.normalizedMetricEvent.count({ where: (authResult.isAdmin && !requestedWs ? {} : { tenantId: authResult.workspaceId }) as any }) },
        { step: '09. Pre-Publication Forecast Evaluation', category: 'Forecasting', count: await db.performanceForecast.count({ where: tenantFilter as any }) },
        { step: '10. Controlled Experimentation', category: 'Experiment', count: await db.experiment.count({ where: (authResult.isAdmin && !requestedWs ? {} : { tenantId: authResult.workspaceId }) as any }) },
      ];

      return NextResponse.json({ events, lineageChain });
    }

    return NextResponse.json(events);
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}

