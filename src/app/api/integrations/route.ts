import { db } from '@/lib/db';
import { apiCredentialsService } from '@/lib/connectors/api-credentials-service';
import { resolveAuthorizedWorkspace, handleWorkspaceAuthError, WorkspaceAuthError } from '@/lib/workspace-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedWs = searchParams.get('workspaceId') || searchParams.get('tenantId');
    const brandIdParam = searchParams.get('brandId');

    const authResult = await resolveAuthorizedWorkspace(req, requestedWs);

    let brandId = brandIdParam;
    if (brandId) {
      const brand = await db.brand.findUnique({
        where: { id: brandId },
        select: { id: true, workspaceId: true, userId: true },
      });

      if (!brand) {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }

      const isAuthorized =
        authResult.isAdmin ||
        brand.workspaceId === authResult.workspaceId ||
        brand.userId === authResult.userId;

      if (!isAuthorized) {
        throw new WorkspaceAuthError('Forbidden: Access denied to integrations for brand in another workspace', 403);
      }
    } else {
      const firstBrand = await db.brand.findFirst({
        where: {
          OR: [
            { workspaceId: authResult.workspaceId },
            { userId: authResult.userId, workspaceId: null },
          ],
          isArchived: false,
        },
        orderBy: { createdAt: 'desc' },
      });
      brandId = firstBrand?.id || '';
    }

    const [connections, dbCredentials] = await Promise.all([
      brandId ? db.platformConnection.findMany({ where: { brandId } }) : [],
      apiCredentialsService.getCredentials(authResult.workspaceId),
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
      workspaceId: authResult.workspaceId,
      brandId,
      connections,
      dbCredentials,
      systemConfig,
    });
  } catch (error: any) {
    return handleWorkspaceAuthError(error);
  }
}

