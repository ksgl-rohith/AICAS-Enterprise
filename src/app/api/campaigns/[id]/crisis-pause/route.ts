import { NextRequest, NextResponse } from 'next/server';
import { crisisPauseService } from '@/lib/publishing/crisis-pause-service';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const body = await req.json();
    const { action, reason, initiatedBy } = body;

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (action === 'pause') {
      const log = await crisisPauseService.pauseBrand(
        'tenant-default',
        campaign.brandId,
        reason || 'Emergency crisis pause initiated',
        initiatedBy || 'operator'
      );
      return NextResponse.json({ success: true, action: 'PAUSED', log });
    }

    if (action === 'resume') {
      const log = await crisisPauseService.resumeBrand(
        'tenant-default',
        campaign.brandId,
        initiatedBy || 'operator'
      );
      return NextResponse.json({ success: true, action: 'RESUMED', log });
    }

    return NextResponse.json({ error: 'Invalid crisis pause action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
