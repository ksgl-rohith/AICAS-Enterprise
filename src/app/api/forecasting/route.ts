import { NextResponse } from 'next/server';
import { forecastingAgent } from '@/lib/ai/forecasting-agent';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');

    const forecasts = await db.performanceForecast.findMany({
      where: brandId ? { brandId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(forecasts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch forecasts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandId, channel, format, campaignId, contentItemId, cta } = body;

    if (!brandId || !channel || !format) {
      return NextResponse.json({ error: 'Missing parameters: brandId, channel, format are required.' }, { status: 400 });
    }

    const forecast = await forecastingAgent.predictPerformance({
      brandId,
      campaignId,
      contentItemId,
      channel,
      format,
      cta,
    });

    return NextResponse.json(forecast);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to compute forecast' }, { status: 400 });
  }
}
