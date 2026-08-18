import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);

    const brand = await db.brand.findUnique({
      where: { id: params.id },
      include: {
        knowledgeDocs: {
          orderBy: { uploadedAt: 'desc' },
        },
        knowledgeChunks: {
          take: 20,
        },
        campaigns: {
          orderBy: { createdAt: 'desc' },
        },
        platformConnections: true,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Verify workspace authorization
    const isAuthorized =
      authResult.isAdmin ||
      brand.workspaceId === authResult.workspaceId ||
      brand.userId === authResult.userId;

    if (!isAuthorized) {
      throw new WorkspaceAuthError('Forbidden: Access denied to brand in another workspace', 403);
    }

    return NextResponse.json(brand);
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);

    const brand = await db.brand.findUnique({
      where: { id: params.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const isAuthorized =
      authResult.isAdmin ||
      brand.workspaceId === authResult.workspaceId ||
      brand.userId === authResult.userId;

    if (!isAuthorized) {
      throw new WorkspaceAuthError('Forbidden: Access denied to update brand in another workspace', 403);
    }

    const body = await req.json();
    const updated = await db.brand.update({
      where: { id: params.id },
      data: {
        name: body.name,
        industry: body.industry,
        description: body.description,
        products: body.products,
        targetAudience: body.targetAudience,
        personality: body.personality,
        tone: body.tone,
        preferredVocabulary: body.preferredVocabulary,
        prohibitedPhrases: body.prohibitedPhrases,
        requiredDisclaimers: body.requiredDisclaimers,
        defaultCTA: body.defaultCTA,
        region: body.region,
        language: body.language,
        brandColors: body.brandColors,
        competitors: body.competitors,
      },
    });

    await db.auditEvent.create({
      data: {
        tenantId: brand.workspaceId || authResult.workspaceId,
        userId: authResult.userId,
        brandId: brand.id,
        action: 'BRAND_UPDATED',
        details: `Brand "${updated.name}" details updated.`,
        entityType: 'Brand',
        entityId: brand.id,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);

    const brand = await db.brand.findUnique({
      where: { id: params.id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const isAuthorized =
      authResult.isAdmin ||
      brand.workspaceId === authResult.workspaceId ||
      brand.userId === authResult.userId;

    if (!isAuthorized) {
      throw new WorkspaceAuthError('Forbidden: Access denied to delete brand in another workspace', 403);
    }

    await db.brand.delete({ where: { id: params.id } });

    await db.auditEvent.create({
      data: {
        tenantId: brand.workspaceId || authResult.workspaceId,
        userId: authResult.userId,
        action: 'BRAND_DELETED',
        details: `Brand "${brand.name}" (${params.id}) deleted.`,
        entityType: 'Brand',
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}

