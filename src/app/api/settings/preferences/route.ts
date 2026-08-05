import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const PreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  density: z.enum(['comfortable', 'compact']).default('comfortable'),
  sidebarDefault: z.enum(['expanded', 'collapsed']).default('expanded'),
  reducedMotion: z.boolean().default(false),

  timezone: z.string().default('UTC'),
  locale: z.string().default('en-US'),
  dateFormat: z.string().default('YYYY-MM-DD'),
  timeFormat: z.string().default('24h'),
  firstDayOfWeek: z.string().default('monday'),

  defaultBrandId: z.string().nullable().optional(),
  defaultApprovalMode: z.string().default('APPROVAL_REQUIRED'),
  defaultCalendarView: z.string().default('month'),
  defaultLanguage: z.string().default('en-US'),
  defaultReportingPeriod: z.string().default('30d'),

  allowedAiProvider: z.enum(['gemini', 'openai', 'mock']).default('gemini'),
  allowedDefaultTextModel: z.enum(['gemini-2.5-flash', 'gpt-4o', 'mock-model']).default('gemini-2.5-flash'),
  allowedImageModel: z.enum(['imagen-3', 'dall-e-3', 'mock-image']).default('imagen-3'),
  executionMode: z.enum(['mock', 'real']).default('mock'),
  fallbackBehavior: z.enum(['mock_fallback', 'error']).default('mock_fallback'),
  costWarningThresholdUsd: z.number().min(0).max(10000).default(250.0),

  notifyApprovals: z.boolean().default(true),
  notifyFailures: z.boolean().default(true),
  notifyCredentialWarnings: z.boolean().default(true),
  notifyCampaignCompletion: z.boolean().default(true),
  notifyCostThreshold: z.boolean().default(true),
  notifyRiskEscalation: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await db.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let prefs = await db.userPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!prefs) {
      prefs = await db.userPreferences.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json(prefs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await db.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'MARKETING_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized permission level' }, { status: 403 });
    }

    const rawBody = await req.json();
    const parseResult = PreferencesSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid preference input values', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const prefs = await db.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...data,
      },
      update: {
        ...data,
      },
    });

    // Record audit event for preference modification
    await db.auditEvent.create({
      data: {
        userId: user.id,
        action: 'ADMIN_PREFERENCES_UPDATED',
        details: `Updated preferences. Provider: ${data.allowedAiProvider}, ExecutionMode: ${data.executionMode}, Theme: ${data.theme}`,
        entityType: 'UserPreferences',
        entityId: prefs.id,
      },
    });

    return NextResponse.json(prefs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
