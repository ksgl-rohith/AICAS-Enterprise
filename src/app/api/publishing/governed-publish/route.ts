import { governedPublisherService } from '@/lib/publishing/governed-publisher-service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandId, contentItemId, channel, idempotencyKey } = body;

    if (!brandId || !contentItemId || !channel) {
      return NextResponse.json(
        { error: 'brandId, contentItemId, and channel are required.' },
        { status: 400 }
      );
    }

    const effectiveIdempotencyKey = idempotencyKey || `ik_${contentItemId}_${channel}_${Date.now()}`;

    const result = await governedPublisherService.publishNow({
      brandId,
      contentItemId,
      channel,
      idempotencyKey: effectiveIdempotencyKey,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
