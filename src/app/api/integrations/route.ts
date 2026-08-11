import { db } from '@/lib/db';
import { apiCredentialsService } from '@/lib/connectors/api-credentials-service';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandIdParam = searchParams.get('brandId');
    const tenantId = 'tenant-default';

    let brandId = brandIdParam;
    if (!brandId) {
      const firstBrand = await db.brand.findFirst();
      brandId = firstBrand?.id || '';
    }

    const [connections, dbCredentials] = await Promise.all([
      brandId ? db.platformConnection.findMany({ where: { brandId } }) : [],
      apiCredentialsService.getCredentials(tenantId),
    ]);

    const hasCred = (provider: string) => dbCredentials.some((c) => c.provider === provider && (c.status === 'configured' || c.status === 'connected'));

    const systemConfig = {
      publishingMode: process.env.PUBLISHING_MODE || 'simulated',
      allowLivePublishing: process.env.ALLOW_LIVE_PUBLISHING === 'true',
      fallbackToSimulator: process.env.FALLBACK_TO_SIMULATOR === 'true',
      aiMode: process.env.AI_MODE || 'mock',
      hasGeminiKey: hasCred('gemini') || !!process.env.GEMINI_API_KEY,
      hasOpenAIKey: hasCred('openai') || !!process.env.OPENAI_API_KEY,
      linkedInEnabled: hasCred('linkedin') || !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      metaEnabled: hasCred('facebook') || hasCred('instagram') || !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
      telegramEnabled: hasCred('telegram') || !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    };

    return NextResponse.json({
      brandId,
      connections,
      dbCredentials,
      systemConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
