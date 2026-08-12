import { brandDeduplicationService } from '@/lib/brand/brand-deduplication-service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { canonicalBrandId, mergedBrandId, reason } = await req.json();
    if (!canonicalBrandId || !mergedBrandId) {
      return NextResponse.json({ error: 'canonicalBrandId and mergedBrandId are required.' }, { status: 400 });
    }

    const result = await brandDeduplicationService.mergeBrands(
      canonicalBrandId,
      mergedBrandId,
      reason || 'Administrator confirmed brand merge',
      'administrator'
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
