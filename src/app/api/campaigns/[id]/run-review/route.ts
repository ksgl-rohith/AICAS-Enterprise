import { db } from '@/lib/db';
import { reviewAgent } from '@/lib/ai/review-agent';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);

    const campaign = await db.campaign.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        contentItems: true,
      },
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
    const reviewResults = [];

    for (const item of campaign.contentItems) {
      const taskId = `task_rev_${item.id}_${Date.now()}`;
      const res = await reviewAgent.execute({
        taskId,
        tenantId,
        brandId: campaign.brandId,
        campaignId: campaign.id,
        input: {
          contentItemId: item.id,
          brandId: campaign.brandId,
        },
      });

      if (res.output) {
        let newStatus = 'IN_REVIEW';
        if (res.output.overallStatus === 'blocked' || res.output.overallStatus === 'needs_revision') {
          newStatus = 'NEEDS_REVISION';
        }

        await db.contentItem.update({
          where: { id: item.id },
          data: { status: newStatus },
        });

        reviewResults.push({ itemId: item.id, review: res.output });

        // Log Agent Run
        await db.agentRun.create({
          data: {
            taskId,
            agentName: 'ReviewAgent',
            status: res.status,
            inputSummary: `ContentItem: ${item.title}`,
            outputSummary: `BrandScore: ${res.output.brandScore}, Compliance: ${res.output.complianceScore}, Status: ${res.output.overallStatus}`,
            confidence: res.confidence,
            warningsJson: JSON.stringify(res.warnings),
            latencyMs: res.usage?.latencyMs || 0,
            modelName: 'review-agent-v1',
          },
        });
      }
    }

    // Update campaign status to IN_REVIEW
    await db.campaign.update({
      where: { id: campaign.id },
      data: { status: 'IN_REVIEW' },
    });

    return NextResponse.json({
      success: true,
      reviews: reviewResults,
    });
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}
