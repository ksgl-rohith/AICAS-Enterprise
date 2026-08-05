import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        strategy: true,
        contentItems: {
          include: {
            variants: true,
            reviewResult: true,
            approvals: {
              orderBy: { decidedAt: 'desc' },
            },
            schedules: true,
            publications: {
              include: {
                metricsSnapshots: { orderBy: { snapshotDate: 'desc' } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await db.campaign.update({
      where: { id: params.id },
      data: {
        name: body.name,
        objective: body.objective,
        productOrTopic: body.productOrTopic,
        description: body.description,
        targetAudience: body.targetAudience,
        offerCTA: body.offerCTA,
        status: body.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await db.campaign.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
