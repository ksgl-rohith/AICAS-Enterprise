import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandIdParam = searchParams.get('brandId');

    let brandId = brandIdParam;
    if (!brandId) {
      const firstBrand = await db.brand.findFirst();
      brandId = firstBrand?.id || '';
    }

    const connections = brandId
      ? await db.platformConnection.findMany({
          where: { brandId },
        })
      : [];

    const systemConfig = {
      publishingMode: process.env.PUBLISHING_MODE || 'simulated',
      allowLivePublishing: process.env.ALLOW_LIVE_PUBLISHING === 'true',
      fallbackToSimulator: process.env.FALLBACK_TO_SIMULATOR === 'true',
      aiMode: process.env.AI_MODE || 'mock',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      linkedInEnabled: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      metaEnabled: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
      telegramEnabled: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    };

    return NextResponse.json({
      brandId,
      connections,
      systemConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
