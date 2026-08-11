import { NextRequest, NextResponse } from 'next/server';
import { approvalService } from '@/lib/approval/approval-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'tenant-default';
    const status = searchParams.get('status') || 'PENDING';

    const result = await approvalService.getApprovalQueue(tenantId, status);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, decision, approvalId, contentItemId, reviewerId, comment, expectedVersion } = body;

    const targetId = approvalId || contentItemId;
    const resolvedAction = action || (decision === 'APPROVED' ? 'approve' : decision === 'REJECTED' ? 'reject' : decision === 'REVISION_REQUESTED' ? 'request_revision' : undefined);

    if (!targetId) {
      return NextResponse.json({ error: 'Missing contentItemId or approvalId' }, { status: 400 });
    }

    if (resolvedAction === 'approve') {
      const res = await approvalService.approve(targetId, reviewerId || 'user_reviewer', comment, expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    if (resolvedAction === 'reject') {
      const res = await approvalService.reject(targetId, reviewerId || 'user_reviewer', comment || 'Rejected', expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    if (resolvedAction === 'request_revision') {
      const res = await approvalService.requestRevision(targetId, reviewerId || 'user_reviewer', comment || 'Revision requested', expectedVersion || 1);
      return NextResponse.json({ success: true, approval: res });
    }

    return NextResponse.json({ error: 'Invalid approval action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
