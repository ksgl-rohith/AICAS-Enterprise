import { NextRequest, NextResponse } from 'next/server';
import { brandContextPackageBuilder } from '@/lib/ai/brand-context-package';
import { db } from '@/lib/db';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await resolveAuthorizedWorkspace(req);
    const brandId = params.id;

    const brand = await db.brand.findUnique({
      where: { id: brandId },
      select: { id: true, workspaceId: true, userId: true },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const isAuthorized =
      authResult.isAdmin ||
      brand.workspaceId === authResult.workspaceId ||
      brand.userId === authResult.userId;

    if (!isAuthorized) {
      throw new WorkspaceAuthError('Forbidden: Access denied to brand in another workspace', 403);
    }

    const pkg = await brandContextPackageBuilder.buildPackage(brandId);

    if (!pkg) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }


    const offerings = pkg.products.length > 0
      ? pkg.products
      : [`${pkg.brandName} Enterprise Platform`, `${pkg.brandName} Solutions`];

    const targetAudiences = pkg.targetAudience
      ? pkg.targetAudience.split(',').map((a) => a.trim()).filter(Boolean)
      : ['Enterprise Decision Makers', 'Executive Leaders', 'Marketing Managers'];

    const defaultOffer = offerings[0] || 'Enterprise Solutions';
    const defaultAudience = targetAudiences[0] || 'Enterprise Decision Makers';
    const defaultCTA = pkg.defaultCTA || 'Request Enterprise Demo & Consultation';

    const ctas = Array.from(new Set([
      defaultCTA,
      `Schedule a ${pkg.brandName} Strategy Session`,
      `Explore ${defaultOffer} Capabilities`,
      'Request Custom Enterprise Proposal',
    ]));

    const pillars = [
      { name: 'Product Innovation & Leadership', angle: 'Highlighting technological advantage and core capabilities' },
      { name: 'Customer Success & Outcomes', angle: 'Verifiable case insights and ROI metrics' },
      { name: 'Industry Intelligence & Compliance', angle: 'Thought leadership and standards governance' },
    ];

    const suggestedCampaignNames = [
      `${pkg.brandName} ${defaultOffer} Leadership Summit`,
      `${pkg.brandName} Enterprise ${pkg.industry} Initiative`,
      `Accelerating ${defaultOffer} Impact`,
    ];

    return NextResponse.json({
      brandName: pkg.brandName,
      industry: pkg.industry,
      offerings,
      targetAudiences,
      ctas,
      pillars,
      defaultOffer,
      defaultAudience,
      defaultCTA,
      suggestedCampaignNames,
    });
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}
