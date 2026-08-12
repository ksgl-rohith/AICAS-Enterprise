import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id;
    const brand = await db.brand.findUnique({
      where: { id: brandId },
      include: {
        knowledgeDocs: true,
        campaigns: { take: 3, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 });
    }

    // 1. Extract products/services/offerings
    const rawProducts = brand.products
      ? brand.products.split(',').map((p) => p.trim()).filter(Boolean)
      : [];

    const offerings = rawProducts.length > 0
      ? rawProducts
      : [`${brand.name} Core Solutions`, `${brand.name} Strategic Advisory`];

    // 2. Extract target audience options
    const rawAudience = brand.targetAudience || '';
    const audienceParts = rawAudience.split(/[,;\n]/).map((a) => a.trim()).filter(Boolean);
    const targetAudiences = audienceParts.length > 0
      ? [rawAudience, ...audienceParts]
      : ['Enterprise Executive Decision Makers', 'Department Directors & Team Leads'];

    // 3. Extract CTA options
    const defaultCTA = brand.defaultCTA || 'Learn More';
    const ctas = Array.from(
      new Set([
        defaultCTA,
        `Schedule a ${brand.industry.includes('Legal') ? 'Legal Consultation' : 'Demo'}`,
        'Download Executive Whitepaper',
        'Request Consultation & Trial',
        'Explore Enterprise Solutions',
      ])
    );

    // 4. Extract content pillars
    const pillars = [
      `${brand.industry} Best Practices`,
      'Product & Service Innovation',
      'Client Success & Case Insights',
      'Regulatory & Quality Compliance',
    ];

    return NextResponse.json({
      brandId: brand.id,
      brandName: brand.name,
      industry: brand.industry,
      offerings,
      targetAudiences,
      ctas,
      pillars,
      defaultOffer: offerings[0] || `${brand.name} Solutions`,
      defaultAudience: audienceParts[0] || rawAudience || 'Enterprise Decision Makers',
      defaultCTA,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
