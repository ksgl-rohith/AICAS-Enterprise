import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const isLineage = searchParams.get('lineage') === 'true';

    const where: any = {};
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
      // Build forward & backward artifact lineage chain
      const lineageChain = [
        { step: '01. Brand Knowledge Source', category: 'Brand', count: await db.ingestionSource.count() },
        { step: '02. RAG Knowledge Vector Index', category: 'Knowledge / RAG', count: await db.knowledgeChunk.count() },
        { step: '03. Campaign Strategy & Pillaring', category: 'Campaign', count: await db.campaignStrategy.count() },
        { step: '04. Multi-Agent Draft Generation', category: 'Content', count: await db.contentItem.count() },
        { step: '05. Quality Council Compliance Review', category: 'Approval', count: await db.reviewResult.count() },
        { step: '06. Human Approval Queue', category: 'Approval', count: await db.approvalRequest.count() },
        { step: '07. Publishing Ledger Execution', category: 'Publishing', count: await db.publicationLedgerEntry.count() },
        { step: '08. Metrics Ingestion & Analytics', category: 'Analytics', count: await db.normalizedMetricEvent.count() },
        { step: '09. Pre-Publication Forecast Evaluation', category: 'Forecasting', count: await db.performanceForecast.count() },
        { step: '10. Controlled Experimentation', category: 'Experiment', count: await db.experiment.count() },
      ];

      return NextResponse.json({ events, lineageChain });
    }

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch audit events' }, { status: 500 });
  }
}
