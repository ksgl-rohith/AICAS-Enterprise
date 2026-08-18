import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contentPlanningAgent } from '@/lib/ai/content-planning-agent';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await resolveAuthorizedWorkspace(request);
    const campaignId = params.id;
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true, strategy: true },
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

    const pillars = campaign.strategy?.contentPillarsJson
      ? JSON.parse(campaign.strategy.contentPillarsJson).map((p: any) => p.name)
      : ['Product Innovation', 'Industry Leadership', 'Customer Success'];

    const planRes = await contentPlanningAgent.execute({
      taskId: `task_plan_${Date.now()}`,
      tenantId,
      brandId: campaign.brandId,
      campaignId,
      input: {
        campaignId,
        campaignName: campaign.name,
        objective: campaign.objective,
        channels: campaign.channels.split(',') as any,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        pillars,
        trends: [],
        postCountTarget: 4,
      },
    });

    return NextResponse.json({
      success: true,
      contentPlan: planRes.output,
    });
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}

