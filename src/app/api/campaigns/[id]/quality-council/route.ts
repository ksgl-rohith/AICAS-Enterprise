import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviewAgent } from '@/lib/ai/review-agent';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const reviews = [];

    for (const item of campaign.contentItems) {
      const res = await reviewAgent.execute({
        taskId: `task_audit_${item.id}`,
        tenantId: 'tenant-default',
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
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Quality Council audit' },
      { status: 500 }
    );
  }
}
