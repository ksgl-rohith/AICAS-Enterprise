import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');

    const campaigns = await db.campaign.findMany({
      where: brandId ? { brandId } : undefined,
      include: {
        brand: {
          select: { id: true, name: true },
        },
        strategy: true,
        contentItems: {
          include: {
            variants: true,
            reviewResult: true,
            schedules: true,
            publications: true,
          },
        },
        _count: {
          select: { contentItems: true, schedules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const brand = await db.brand.findUnique({
      where: { id: body.brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Selected Brand not found' }, { status: 400 });
    }

    const campaign = await db.campaign.create({
      data: {
        brandId: body.brandId,
        name: body.name,
        objective: body.objective || 'awareness',
        productOrTopic: body.productOrTopic,
        description: body.description || '',
        targetAudience: body.targetAudience || brand.targetAudience,
        offerCTA: body.offerCTA || brand.defaultCTA,
        startDate: new Date(body.startDate || Date.now()),
        endDate: new Date(body.endDate || Date.now() + 14 * 24 * 3600 * 1000),
        channels: Array.isArray(body.channels) ? body.channels.join(',') : body.channels || 'linkedin,facebook',
        region: body.region || brand.region,
        language: body.language || brand.language,
        textPostCount: body.textPostCount ? parseInt(body.textPostCount, 10) : 3,
        imageBriefCount: body.imageBriefCount ? parseInt(body.imageBriefCount, 10) : 2,
        carouselCount: body.carouselCount ? parseInt(body.carouselCount, 10) : 1,
        postingFrequency: body.postingFrequency || 'daily',
        requiredMessages: body.requiredMessages || '',
        prohibitedThemes: body.prohibitedThemes || '',
        groundingRequired: body.groundingRequired !== false,
        approvalRequired: body.approvalRequired !== false,
        status: 'PLANNING',
      },
    });

    await db.auditEvent.create({
      data: {
        userId: brand.userId,
        brandId: brand.id,
        campaignId: campaign.id,
        action: 'CAMPAIGN_CREATED',
        details: `Campaign "${campaign.name}" created (${campaign.channels} channels).`,
        entityType: 'Campaign',
        entityId: campaign.id,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
