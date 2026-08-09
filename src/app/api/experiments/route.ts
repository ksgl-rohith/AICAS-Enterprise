import { NextResponse } from 'next/server';
import { experimentAgent } from '@/lib/ai/experiment-agent';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');
    const mode = searchParams.get('mode');

    if (mode === 'ai_recommendations') {
      const recs = await experimentAgent.generateAiRecommendations(brandId || 'b_default');
      return NextResponse.json(recs);
    }

    const experiments = await db.experiment.findMany({
      where: brandId ? { brandId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(experiments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch experiments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, proposal } = body;

    if (action === 'evaluate_user_proposal') {
      const evaluation = experimentAgent.evaluateUserProposal(proposal);
      return NextResponse.json(evaluation);
    }

    if (action === 'create_from_proposal') {
      const created = await experimentAgent.execute({
        taskId: `task_exp_${Date.now()}`,
        tenantId: 'tenant-default',
        brandId: proposal.brandId || 'b_default',
        input: {
          brandId: proposal.brandId || 'b_default',
          campaignId: proposal.campaignId,
          hypothesis: proposal.hypothesis,
          primaryMetric: proposal.primaryMetric,
        },
      });
      return NextResponse.json(created);
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process experiment request' }, { status: 400 });
  }
}
