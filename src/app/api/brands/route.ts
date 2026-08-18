import { brandDeduplicationService } from '@/lib/brand/brand-deduplication-service';
import { DomainNormalizer } from '@/lib/brand/domain-normalizer';
import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError } from '@/lib/workspace-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedWs = searchParams.get('workspaceId') || searchParams.get('tenantId');

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    const brands = await db.brand.findMany({
      where: {
        OR: [
          { workspaceId: authResult.workspaceId },
          { userId: authResult.userId, workspaceId: null },
        ],
        isArchived: false,
      },
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
    return handleWorkspaceAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestedWs = body.workspaceId || body.tenantId;

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    const websiteUrl = body.websiteUrl || body.originalWebsiteUrl || null;
    const normalized = DomainNormalizer.normalize(websiteUrl);

    // 1. Run Duplicate Detection (scoped to authorized workspace)
    const dupCheck = await brandDeduplicationService.detectDuplicate(authResult.workspaceId, body.name, websiteUrl);
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
        userId: authResult.userId,
        workspaceId: authResult.workspaceId,
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
        tenantId: authResult.workspaceId,
        userId: authResult.userId,
        brandId: brand.id,
        action: 'BRAND_CREATED',
        details: `Brand "${brand.name}" created in workspace "${authResult.workspace.name}" (${normalized?.normalizedDomain || 'no domain'}).`,
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
    return handleWorkspaceAuthError(error);
  }
}

