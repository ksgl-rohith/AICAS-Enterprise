import { NextRequest, NextResponse } from 'next/server';
import { approvalService } from '@/lib/approval/approval-service';
import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedWs = searchParams.get('workspaceId') || searchParams.get('tenantId');
    const status = searchParams.get('status') || 'PENDING';

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    const result = await approvalService.getApprovalQueue(authResult.workspaceId, status);
    return NextResponse.json(result);
  } catch (err: any) {
    return handleWorkspaceAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);
    const body = await req.json();
    const { action, decision, approvalId, contentItemId, reviewerId, comment, expectedVersion } = body;

    const targetId = approvalId || contentItemId;
    const resolvedAction = action || (decision === 'APPROVED' ? 'approve' : decision === 'REJECTED' ? 'reject' : decision === 'REVISION_REQUESTED' ? 'request_revision' : undefined);

    if (!targetId) {
      return NextResponse.json({ error: 'Missing contentItemId or approvalId' }, { status: 400 });
    }

    // Verify content item belongs to authorized workspace
    const item = await db.contentItem.findFirst({
      where: {
        OR: [
          { id: targetId },
          { approvals: { some: { id: targetId } } },
        ],
      },
      include: {
        campaign: { include: { brand: true } },
      },
    });

    if (item) {
      const isAuthorized =
        authResult.isAdmin ||
        item.campaign.brand.workspaceId === authResult.workspaceId ||
        item.campaign.brand.userId === authResult.userId;

      if (!isAuthorized) {
        throw new WorkspaceAuthError('Forbidden: Access denied to approval item in another workspace', 403);
      }
    }

    const reviewer = reviewerId || authResult.user.name || 'user_reviewer';

    if (resolvedAction === 'approve') {
      const res = await approvalService.approve(targetId, reviewer, comment, expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    if (resolvedAction === 'reject') {
      const res = await approvalService.reject(targetId, reviewer, comment || 'Rejected', expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    if (resolvedAction === 'request_revision') {
      const res = await approvalService.requestRevision(targetId, reviewer, comment || 'Revision requested', expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    return NextResponse.json({ error: 'Invalid approval action' }, { status: 400 });
  } catch (err: any) {
    return handleWorkspaceAuthError(err);
  }
}

