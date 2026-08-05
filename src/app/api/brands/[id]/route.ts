import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
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

    return NextResponse.json(brand);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
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

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await db.brand.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
