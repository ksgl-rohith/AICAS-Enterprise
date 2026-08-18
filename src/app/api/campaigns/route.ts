import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');
    const requestedWs = searchParams.get('workspaceId') || searchParams.get('tenantId');

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    let whereClause: any = {
      brand: {
        OR: [
          { workspaceId: authResult.workspaceId },
          { userId: authResult.userId, workspaceId: null },
        ],
      },
    };

    if (brandId) {
      // If brandId specified, ensure it belongs to authorized workspace
      const targetBrand = await db.brand.findUnique({
        where: { id: brandId },
        select: { id: true, workspaceId: true, userId: true },
      });

      if (!targetBrand) {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }

      const isBrandAuthorized =
        authResult.isAdmin ||
        targetBrand.workspaceId === authResult.workspaceId ||
        targetBrand.userId === authResult.userId;

      if (!isBrandAuthorized) {
        throw new WorkspaceAuthError('Forbidden: Access denied to campaigns for brand in another workspace', 403);
      }

      whereClause = { brandId };
    }

    const campaigns = await db.campaign.findMany({
      where: whereClause,
      include: {
        brand: {
          select: { id: true, name: true, workspaceId: true },
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
    return handleWorkspaceAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestedWs = body.workspaceId || body.tenantId;

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    if (!body.brandId) {
      return NextResponse.json({ error: 'brandId is required' }, { status: 400 });
    }

    const brand = await db.brand.findUnique({
      where: { id: body.brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Selected Brand not found' }, { status: 404 });
    }

    // Verify brand belongs to authorized workspace
    const isBrandAuthorized =
      authResult.isAdmin ||
      brand.workspaceId === authResult.workspaceId ||
      brand.userId === authResult.userId;

    if (!isBrandAuthorized) {
      throw new WorkspaceAuthError(
        'Forbidden: Access denied to create campaign for brand in another workspace',
        403
      );
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
        tenantId: brand.workspaceId || authResult.workspaceId,
        userId: authResult.userId,
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
    return handleWorkspaceAuthError(error);
  }
}

