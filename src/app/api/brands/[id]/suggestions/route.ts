import { NextRequest, NextResponse } from 'next/server';
import { brandContextPackageBuilder } from '@/lib/ai/brand-context-package';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id;
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
    console.error('Error generating brand suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch brand suggestions' }, { status: 500 });
  }
}
