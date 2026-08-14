import { campaignLifecycleOrchestrator } from '@/lib/workflow/campaign-lifecycle-orchestrator';
import { getSessionFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    const userId = session?.userId || 'SYSTEM';

    const result = await campaignLifecycleOrchestrator.approveStrategy(params.id, userId);

    return NextResponse.json({
      success: true,
      count: result.contentCount,
      autoScheduledCount: result.autoScheduledCount,
      pendingApprovalCount: result.pendingApprovalCount,
      oversightMode: result.oversightMode,
      campaign: result.campaign,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Content generation failed' }, { status: 500 });
  }
}

