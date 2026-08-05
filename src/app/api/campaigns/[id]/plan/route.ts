import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contentPlanningAgent } from '@/lib/ai/content-planning-agent';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true, strategy: true },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    const pillars = campaign.strategy?.contentPillarsJson
      ? JSON.parse(campaign.strategy.contentPillarsJson).map((p: any) => p.name)
      : ['Product Innovation', 'Industry Leadership', 'Customer Success'];

    const planRes = await contentPlanningAgent.execute({
      taskId: `task_plan_${Date.now()}`,
      tenantId: 'tenant-default',
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
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate content plan' },
      { status: 500 }
    );
  }
}
