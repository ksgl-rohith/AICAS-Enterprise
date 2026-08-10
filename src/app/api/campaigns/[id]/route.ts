import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        strategy: true,
        contentItems: {
          include: {
            variants: true,
            reviewResult: true,
            approvals: {
              orderBy: { decidedAt: 'desc' },
            },
            schedules: true,
            publications: {
              include: {
                metricsSnapshots: { orderBy: { snapshotDate: 'desc' } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    // 1. Handle Content Variant Human Rewrite
    if (body.variantId && body.variant) {
      const updatedVariant = await db.contentVariant.update({
        where: { id: body.variantId },
        data: {
          headline: body.variant.headline,
          hook: body.variant.hook,
          bodyText: body.variant.bodyText,
          ctaText: body.variant.ctaText,
          hashtags: body.variant.hashtags,
          status: 'HUMAN_EDITED',
        },
      });
      return NextResponse.json({ success: true, variant: updatedVariant });
    }

    // 2. Handle Strategy Human Rewrite
    if (body.strategy) {
      const updatedStrategy = await db.campaignStrategy.update({
        where: { campaignId: params.id },
        data: {
          campaignNarrative: body.strategy.campaignNarrative,
          objectiveInterpretation: body.strategy.objectiveInterpretation,
          audienceSummary: body.strategy.audienceSummary,
          contentPillarsJson: body.strategy.contentPillarsJson,
          channelRolesJson: body.strategy.channelRolesJson,
          contentIdeasJson: body.strategy.contentIdeasJson,
        },
      });
      return NextResponse.json({ success: true, strategy: updatedStrategy });
    }

    // 3. Handle Campaign Metadata Update
    const updated = await db.campaign.update({
      where: { id: params.id },
      data: {
        name: body.name,
        objective: body.objective,
        productOrTopic: body.productOrTopic,
        description: body.description,
        targetAudience: body.targetAudience,
        offerCTA: body.offerCTA,
        status: body.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await db.campaign.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
