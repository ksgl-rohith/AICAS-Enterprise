import { NextRequest, NextResponse } from 'next/server';
import { schedulingAgent } from '@/lib/ai/scheduling-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, brandId, channel, startDate, endDate, timezone, contentCategory, blackoutWindows, existingSchedules } = body;

    const res = await schedulingAgent.execute({
      taskId: `task_sched_${Date.now()}`,
      tenantId: 'tenant-default',
      brandId: brandId || 'brand-default',
      campaignId: campaignId || 'camp-default',
      input: {
        campaignId: campaignId || 'camp-default',
        brandId: brandId || 'brand-default',
        channel: channel || 'linkedin',
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: timezone || 'UTC',
        contentCategory: contentCategory || 'campaign',
        blackoutWindows: blackoutWindows || [],
        existingSchedules: existingSchedules || [],
      },
    });

    return NextResponse.json({ success: true, scheduling: res.output });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
