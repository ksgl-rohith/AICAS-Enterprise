import { db } from '@/lib/db';
import { optimizationAgent } from '@/lib/ai/optimization-agent';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const recommendations = await db.recommendation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(recommendations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandId } = body;

    let targetBrandId = brandId;
    if (!targetBrandId) {
      const brand = await db.brand.findFirst();
      targetBrandId = brand?.id || '';
    }

    const taskId = `task_opt_${Date.now()}`;
    const result = await optimizationAgent.execute({
      taskId,
      tenantId: 'tenant-default',
      brandId: targetBrandId,
      input: { brandId: targetBrandId },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
