import { db } from '@/lib/db';
import { getBrandsForWorkspace } from '@/lib/workspace-filter';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const workspaceId = searchParams.get('workspaceId') || searchParams.get('tenantId');

    let whereClause: any = {};
    if (campaignId) {
      whereClause.campaignId = campaignId;
    } else if (workspaceId) {
      const allowedBrandIds = await getBrandsForWorkspace(workspaceId);
      whereClause.campaign = { brandId: { in: allowedBrandIds } };
    }

    const schedules = await db.schedule.findMany({
      where: whereClause,
      include: {
        campaign: { include: { brand: true } },
        contentItem: { include: { variants: true } },
        publications: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentItemId, channel, scheduledTime, timezone } = body;

    const contentItem = await db.contentItem.findUnique({
      where: { id: contentItemId },
      include: { campaign: true },
    });

    if (!contentItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }

    if (contentItem.status !== 'APPROVED' && contentItem.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'Only APPROVED content items can be scheduled for publishing.' }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledTime);

    // Collision check: check if post scheduled within 30 mins on same channel
    const existingCollision = await db.schedule.findFirst({
      where: {
        channel,
        status: { in: ['SCHEDULED', 'PUBLISHING'] },
        scheduledTime: {
          gte: new Date(scheduledDate.getTime() - 30 * 60 * 1000),
          lte: new Date(scheduledDate.getTime() + 30 * 60 * 1000),
        },
      },
    });

    if (existingCollision) {
      return NextResponse.json({
        error: `Schedule collision detected! Another post is scheduled on ${channel} within 30 minutes of selected slot.`,
      }, { status: 409 });
    }

    const schedule = await db.schedule.create({
      data: {
        campaignId: contentItem.campaignId,
        contentItemId,
        channel,
        scheduledTime: scheduledDate,
        timezone: timezone || 'UTC',
        status: 'SCHEDULED',
      },
    });

    await db.contentItem.update({
      where: { id: contentItemId },
      data: { status: 'SCHEDULED' },
    });

    const user = await db.user.findFirst();
    await db.auditEvent.create({
      data: {
        userId: user?.id,
        brandId: contentItem.campaign.brandId,
        campaignId: contentItem.campaignId,
        action: 'SCHEDULED',
        details: `Scheduled "${contentItem.title}" on ${channel} for ${scheduledDate.toISOString()}`,
        entityType: 'Schedule',
        entityId: schedule.id,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
