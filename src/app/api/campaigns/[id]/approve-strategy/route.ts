import { campaignLifecycleOrchestrator } from '@/lib/workflow/campaign-lifecycle-orchestrator';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await campaignLifecycleOrchestrator.approveStrategy(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Strategy approval failed' }, { status: 500 });
  }
}
