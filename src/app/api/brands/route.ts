import { brandDeduplicationService } from '@/lib/brand/brand-deduplication-service';
import { DomainNormalizer } from '@/lib/brand/domain-normalizer';
import { db } from '@/lib/db';
import { getBrandsForWorkspace } from '@/lib/workspace-filter';
import { getSessionFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || searchParams.get('tenantId');

    let whereClause: any = undefined;
    if (workspaceId) {
      const allowedBrandIds = await getBrandsForWorkspace(workspaceId);
      whereClause = { id: { in: allowedBrandIds } };
    }

    const brands = await db.brand.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            knowledgeDocs: true,
            campaigns: true,
            platformConnections: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(brands);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to create brand profile' }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    const body = await req.json();

    const websiteUrl = body.websiteUrl || body.originalWebsiteUrl || null;
    const normalized = DomainNormalizer.normalize(websiteUrl);

    // 1. Run Duplicate Detection
    const dupCheck = await brandDeduplicationService.detectDuplicate('tenant-default', body.name, websiteUrl);
    if (dupCheck.matchType === 'EXACT_DUPLICATE') {
      return NextResponse.json(
        {
          error: `A Brand Profile already exists for this website (${dupCheck.existingBrand?.name}). Duplicate profile creation blocked.`,
          isDuplicate: true,
          matchType: dupCheck.matchType,
          existingBrandId: dupCheck.existingBrand?.id,
          existingBrandName: dupCheck.existingBrand?.name,
        },
        { status: 409 }
      );
    }

    const brand = await db.brand.create({
      data: {
        userId: user.id,
        workspaceId: body.workspaceId || body.tenantId || null,
        name: body.name,
        industry: body.industry || 'Technology',
        description: body.description || '',
        products: body.products || '',
        targetAudience: body.targetAudience || '',
        personality: body.personality || 'Authoritative & Innovative',
        tone: body.tone || 'Professional',
        preferredVocabulary: body.preferredVocabulary || '',
        prohibitedPhrases: body.prohibitedPhrases || '',
        requiredDisclaimers: body.requiredDisclaimers || '',
        defaultCTA: body.defaultCTA || 'Learn More',
        region: body.region || 'Global',
        language: body.language || 'en-US',
        brandColors: body.brandColors || '#6366f1,#4f46e5',
        competitors: body.competitors || '',
        originalWebsiteUrl: normalized?.originalWebsiteUrl || websiteUrl,
        canonicalWebsiteUrl: normalized?.canonicalWebsiteUrl || null,
        normalizedDomain: normalized?.normalizedDomain || null,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: user.id,
        brandId: brand.id,
        action: 'BRAND_CREATED',
        details: `Brand "${brand.name}" created (${normalized?.normalizedDomain || 'no domain'}).`,
        entityType: 'Brand',
        entityId: brand.id,
      },
    });

    return NextResponse.json(
      {
        ...brand,
        probableDuplicateWarning: dupCheck.matchType === 'PROBABLE_DUPLICATE' ? dupCheck.rationale : undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
