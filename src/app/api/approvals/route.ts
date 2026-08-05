import { NextRequest, NextResponse } from 'next/server';
import { approvalService } from '@/lib/approval/approval-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'tenant-default';
    const status = searchParams.get('status') || 'PENDING';

    const queue = await approvalService.getApprovalQueue(tenantId, status);
    return NextResponse.json({ success: true, count: queue.length, queue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, approvalId, reviewerId, comment, expectedVersion } = body;

    if (action === 'approve') {
      const res = await approvalService.approve(approvalId, reviewerId || 'user_reviewer', comment, expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    if (action === 'reject') {
      const res = await approvalService.reject(approvalId, reviewerId || 'user_reviewer', comment || 'Rejected', expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    if (action === 'request_revision') {
      const res = await approvalService.requestRevision(approvalId, reviewerId || 'user_reviewer', comment || 'Revision requested', expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    return NextResponse.json({ error: 'Invalid approval action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
