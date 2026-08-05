import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandId: brandIdParam, platform } = body;

    let brandId = brandIdParam;
    if (!brandId) {
      const firstBrand = await db.brand.findFirst();
      brandId = firstBrand?.id || '';
    }

    if (!brandId || !platform) {
      return NextResponse.json({ error: 'Brand ID and platform are required' }, { status: 400 });
    }

    await db.platformConnection.deleteMany({
      where: {
        brandId,
        platform,
      },
    });

    return NextResponse.json({ success: true, message: `Successfully disconnected ${platform}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
