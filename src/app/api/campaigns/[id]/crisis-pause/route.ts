import { NextRequest, NextResponse } from 'next/server';
import { crisisPauseService } from '@/lib/publishing/crisis-pause-service';
import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);
    const campaignId = params.id;
    const body = await req.json();
    const { action, reason, initiatedBy } = body;

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
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

    const tenantId = campaign.brand.workspaceId || authResult.workspaceId;

    if (action === 'pause') {
      const log = await crisisPauseService.pauseBrand(
        tenantId,
        campaign.brandId,
        reason || 'Emergency crisis pause initiated',
        initiatedBy || authResult.user.name || 'operator'
      );
      return NextResponse.json({ success: true, action: 'PAUSED', log });
    }

    if (action === 'resume') {
      const log = await crisisPauseService.resumeBrand(
        tenantId,
        campaign.brandId,
        initiatedBy || authResult.user.name || 'operator'
      );
      return NextResponse.json({ success: true, action: 'RESUMED', log });
    }

    return NextResponse.json({ error: 'Invalid crisis pause action' }, { status: 400 });
  } catch (err: any) {
    return handleWorkspaceAuthError(err);
  }
}

