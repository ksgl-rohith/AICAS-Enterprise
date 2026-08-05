import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await db.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 });
    }

    const brand = await db.brand.create({
      data: {
        userId: user.id,
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
      },
    });

    await db.auditEvent.create({
      data: {
        userId: user.id,
        brandId: brand.id,
        action: 'BRAND_CREATED',
        details: `Brand "${brand.name}" created.`,
        entityType: 'Brand',
        entityId: brand.id,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
