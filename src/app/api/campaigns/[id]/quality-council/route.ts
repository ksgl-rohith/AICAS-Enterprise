import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviewAgent } from '@/lib/ai/review-agent';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await resolveAuthorizedWorkspace(request);
    const campaignId = params.id;
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        brand: true,
        contentItems: {
          include: {
            reviewResult: true,
            variants: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    const isAuthorized =
      authResult.isAdmin ||
      campaign.brand.workspaceId === authResult.workspaceId ||
      campaign.brand.userId === authResult.userId;

    if (!isAuthorized) {
      throw new WorkspaceAuthError('Forbidden: Access denied to campaign in another workspace', 403);
    }

    const tenantId = campaign.brand.workspaceId || authResult.workspaceId;
    const reviews = [];

    for (const item of campaign.contentItems) {
      const res = await reviewAgent.execute({
        taskId: `task_audit_${item.id}`,
        tenantId,
        brandId: campaign.brandId,
        campaignId,
        input: {
          contentItemId: item.id,
          brandId: campaign.brandId,
        },
      });

      reviews.push({
        contentItemId: item.id,
        title: item.title,
        format: item.format,
        status: item.status,
        qualityCouncilResult: res.output,
      });
    }

    return NextResponse.json({
      success: true,
      campaignId,
      brandName: campaign.brand.name,
      totalItemsReviewed: reviews.length,
      reviews,
    });
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}

