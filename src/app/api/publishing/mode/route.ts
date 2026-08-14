import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditService } from '@/lib/services/audit-service';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const userRole = session?.role || 'MARKETING_MANAGER';
    const isAdmin = userRole === 'ADMIN';

    const allowLivePublishing = process.env.ALLOW_LIVE_PUBLISHING === 'true';
    const envMode = process.env.PUBLISHING_MODE || 'simulated';

    // Fetch user preferences for current user / tenant
    const pref = session?.userId
      ? await db.userPreferences.findUnique({ where: { userId: session.userId } })
      : await db.userPreferences.findFirst();

    const runtimeMode = (pref as any)?.publishingMode || (envMode === 'live' && allowLivePublishing ? 'LIVE' : 'SIMULATED');

    return NextResponse.json({
      success: true,
      mode: allowLivePublishing ? runtimeMode : 'SIMULATED',
      allowLivePublishing,
      canManage: isAdmin,
      infrastructureBlocked: !allowLivePublishing,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch publishing mode' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const userRole = session?.role || 'MARKETING_MANAGER';
    const isAdmin = userRole === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Permission denied: Requires workspace.publishing.manage or ADMIN role to switch publishing mode.' },
        { status: 403 }
      );
    }

    const allowLivePublishing = process.env.ALLOW_LIVE_PUBLISHING === 'true';
    const body = await req.json();
    const requestedMode = body.mode === 'LIVE' ? 'LIVE' : 'SIMULATED';

    // Safety Precedence Enforcement: Infrastructure Safety Flag > Workspace Policy > User Request
    if (requestedMode === 'LIVE' && !allowLivePublishing) {
      return NextResponse.json(
        {
          error: 'Live publishing unavailable in this environment. Infrastructure safety policy ALLOW_LIVE_PUBLISHING is set to false.',
          mode: 'SIMULATED',
          allowLivePublishing: false,
        },
        { status: 400 }
      );
    }

    const user = session?.userId
      ? await db.user.findUnique({ where: { id: session.userId } })
      : await db.user.findFirst();

    if (user) {
      await db.userPreferences.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          executionMode: 'mock',
          publishingMode: requestedMode,
        },
        update: {
          publishingMode: requestedMode,
        },
      });

      // Record Audit Event
      await auditService.recordEvent({
        category: 'Publishing',
        severity: requestedMode === 'LIVE' ? 'warning' : 'info',
        action: 'publishing.mode.changed',
        details: `Workspace publishing mode switched from '${requestedMode === 'LIVE' ? 'SIMULATED' : 'LIVE'}' to '${requestedMode}'. Approved publishing actions will target ${requestedMode === 'LIVE' ? 'real connected platform APIs' : 'the simulated sandbox'}.`,
        entityType: 'PublishingPolicy',
        entityId: user.id,
        userId: user.id,
      });
    }

    return NextResponse.json({
      success: true,
      mode: requestedMode,
      allowLivePublishing,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update publishing mode' }, { status: 500 });
  }
}
