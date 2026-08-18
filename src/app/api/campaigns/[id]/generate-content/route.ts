import { campaignLifecycleOrchestrator } from '@/lib/workflow/campaign-lifecycle-orchestrator';
import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);
    const userId = authResult.userId;

    const campaign = await db.campaign.findUnique({
      where: { id: params.id },
      include: { brand: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const isAuthorized =
      authResult.isAdmin ||
      campaign.brand.workspaceId === authResult.workspaceId ||
      campaign.brand.userId === authResult.userId;

    if (!isAuthorized) {
      throw new WorkspaceAuthError('Forbidden: Access denied to campaign in another workspace', 403);
    }

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
    return handleWorkspaceAuthError(error);
  }
}


