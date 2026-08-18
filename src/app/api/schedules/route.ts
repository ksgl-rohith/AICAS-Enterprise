import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const requestedWs = searchParams.get('workspaceId') || searchParams.get('tenantId');

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    let whereClause: any = {
      campaign: {
        brand: {
          OR: [
            { workspaceId: authResult.workspaceId },
            { userId: authResult.userId, workspaceId: null },
          ],
        },
      },
    };

    if (campaignId) {
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
        throw new WorkspaceAuthError('Forbidden: Access denied to schedules in another workspace', 403);
      }

      whereClause = { campaignId };
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
    return handleWorkspaceAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);
    const body = await req.json();
    const { contentItemId, channel, scheduledTime, timezone } = body;

    const contentItem = await db.contentItem.findUnique({
      where: { id: contentItemId },
      include: { campaign: { include: { brand: true } } },
    });

    if (!contentItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }

    const isAuthorized =
      authResult.isAdmin ||
      contentItem.campaign.brand.workspaceId === authResult.workspaceId ||
      contentItem.campaign.brand.userId === authResult.userId;

    if (!isAuthorized) {
      throw new WorkspaceAuthError('Forbidden: Access denied to content item in another workspace', 403);
    }

    if (contentItem.status !== 'APPROVED' && contentItem.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'Only APPROVED content items can be scheduled for publishing.' }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledTime);

    // Collision check: check if post scheduled within 30 mins on same channel for this brand
    const existingCollision = await db.schedule.findFirst({
      where: {
        channel,
        campaign: { brandId: contentItem.campaign.brandId },
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

    await db.auditEvent.create({
      data: {
        tenantId: contentItem.campaign.brand.workspaceId || authResult.workspaceId,
        userId: authResult.userId,
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
    return handleWorkspaceAuthError(error);
  }
}

