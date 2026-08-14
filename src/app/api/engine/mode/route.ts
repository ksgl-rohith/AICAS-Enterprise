import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auditService } from '@/lib/services/audit-service';

export async function GET() {
  try {
    const pref = await db.userPreferences.findFirst();
    const mode = pref?.executionMode || 'mock';

    const hasGeminiKey = Boolean((process.env.GEMINI_API_KEY || '').trim());
    const hasOpenAIKey = Boolean((process.env.OPENAI_API_KEY || '').trim());
    const realAvailable = hasGeminiKey || hasOpenAIKey;

    return NextResponse.json({
      mode,
      realAvailable,
      hasGeminiKey,
      hasOpenAIKey,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch engine mode' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestedMode = body.mode === 'real' ? 'real' : 'mock';

    const hasGeminiKey = Boolean((process.env.GEMINI_API_KEY || '').trim());
    const hasOpenAIKey = Boolean((process.env.OPENAI_API_KEY || '').trim());
    const realAvailable = hasGeminiKey || hasOpenAIKey;

    if (requestedMode === 'real' && !realAvailable) {
      return NextResponse.json(
        {
          error: 'REAL Engine unavailable. Reason: AI provider credentials (GEMINI_API_KEY or OPENAI_API_KEY) are not configured.',
          mode: 'mock',
          realAvailable: false,
        },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst();
    if (user) {
      await db.userPreferences.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          executionMode: requestedMode,
        },
        update: {
          executionMode: requestedMode,
        },
      });

      await auditService.recordEvent({
        category: 'AI / Model',
        severity: 'info',
        action: 'engine.mode.changed',
        details: `System AI Engine execution mode switched to '${requestedMode.toUpperCase()}'.`,
        entityType: 'UserPreferences',
        entityId: user.id,
        userId: user.id,
      });
    }

    return NextResponse.json({
      success: true,
      mode: requestedMode,
      realAvailable,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update engine mode' }, { status: 500 });
  }
}
