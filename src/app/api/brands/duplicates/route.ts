import { brandDeduplicationService } from '@/lib/brand/brand-deduplication-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const candidatePairs = await brandDeduplicationService.findPotentialDuplicates('tenant-default');
    return NextResponse.json({ candidatePairs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
