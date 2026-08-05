import { NextRequest, NextResponse } from 'next/server';
import { deadLetterQueue } from '@/lib/publishing/dead-letter-queue';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'tenant-default';

    const items = await deadLetterQueue.getOpenItems(tenantId);
    return NextResponse.json({ success: true, count: items.length, items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, dlqId, note } = body;

    if (action === 'resolve_manual') {
      const res = await deadLetterQueue.resolveManual(dlqId, note || 'Resolved manually by operator');
      return NextResponse.json({ success: true, item: res });
    }

    if (action === 'resolve_retry') {
      const res = await deadLetterQueue.resolveRetry(dlqId);
      return NextResponse.json({ success: true, item: res });
    }

    return NextResponse.json({ error: 'Invalid incident resolution action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
