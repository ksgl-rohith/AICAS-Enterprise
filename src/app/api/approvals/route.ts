import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const items = await db.contentItem.findMany({
      include: {
        campaign: {
          include: { brand: true },
        },
        variants: true,
        reviewResult: true,
        approvals: {
          orderBy: { decidedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contentItemId, decision, comment, editedContent } = body;

    const contentItem = await db.contentItem.findUnique({
      where: { id: contentItemId },
      include: { campaign: true },
    });

    if (!contentItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }

    const user = await db.user.findFirst();

    // Create approval record
    const approval = await db.approval.create({
      data: {
        contentItemId,
        reviewerId: user?.id || null,
        decision, // 'APPROVED', 'REVISION_REQUESTED', 'REJECTED'
        comment: comment || null,
        editedContent: editedContent || null,
      },
    });

    // Update ContentItem status
    let newStatus = 'IN_REVIEW';
    if (decision === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (decision === 'REVISION_REQUESTED') {
      newStatus = 'NEEDS_REVISION';
    } else if (decision === 'REJECTED') {
      newStatus = 'REJECTED';
    }

    await db.contentItem.update({
      where: { id: contentItemId },
      data: { status: newStatus },
    });

    // Audit event
    await db.auditEvent.create({
      data: {
        userId: user?.id,
        brandId: contentItem.campaign.brandId,
        campaignId: contentItem.campaignId,
        action: decision === 'APPROVED' ? 'APPROVED' : decision === 'REVISION_REQUESTED' ? 'REVISION_REQUESTED' : 'REJECTED',
        details: `Content item "${contentItem.title}" decision: ${decision}. ${comment ? `Comment: ${comment}` : ''}`,
        entityType: 'ContentItem',
        entityId: contentItemId,
      },
    });

    return NextResponse.json({
      success: true,
      approval,
      newStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
