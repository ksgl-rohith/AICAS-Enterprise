import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditService } from '@/lib/services/audit-service';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid authentication session required' },
        { status: 401 }
      );
    }

    const allowLivePublishing = process.env.ALLOW_LIVE_PUBLISHING === 'true';
    const envMode = process.env.PUBLISHING_MODE || 'simulated';

    // Fetch user preferences for current user
    const pref = await db.userPreferences.findUnique({ where: { userId: session.userId } });
    const runtimeMode = (pref as any)?.publishingMode || (envMode === 'live' && allowLivePublishing ? 'LIVE' : 'SIMULATED');

    return NextResponse.json({
      success: true,
      mode: allowLivePublishing ? runtimeMode : 'SIMULATED',
      allowLivePublishing,
      canManage: true, // All authenticated workspace members can request toggle
      infrastructureBlocked: !allowLivePublishing,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch publishing mode' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to switch publishing mode' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const userRole = session.role || 'MARKETING_MANAGER';
    const isAdmin = userRole === 'ADMIN';

    const body = await req.json();
    const requestedMode = body.mode === 'LIVE' ? 'LIVE' : 'SIMULATED';
    const targetWorkspaceId = body.workspaceId || body.tenantId;

    // Cross-Workspace Isolation & Authorization Verification:
    // If a specific workspace is targeted, ensure caller is a member or platform ADMIN.
    if (targetWorkspaceId && !isAdmin) {
      // Check real DB membership
      const membership = await db.workspaceMembership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: targetWorkspaceId,
            userId,
          },
        },
      });

      // Also support legacy/demo tenant IDs if user is active
      const isLegacyDemoTenant = ['tenant-default', 'tenant-demo-003'].includes(targetWorkspaceId);

      if (!membership && !isLegacyDemoTenant) {
        return NextResponse.json(
          { error: 'Forbidden: You are not an authorized member of the requested workspace.' },
          { status: 403 }
        );
      }
    }

    const allowLivePublishing = process.env.ALLOW_LIVE_PUBLISHING === 'true';

    // Infrastructure Safety Precedence Enforcement:
    // Infrastructure Flag (ALLOW_LIVE_PUBLISHING) > Workspace Policy > User Request
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

    const pref = await db.userPreferences.findUnique({ where: { userId } });
    const previousMode = (pref as any)?.publishingMode || 'SIMULATED';

    await db.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        executionMode: 'mock',
        publishingMode: requestedMode,
      },
      update: {
        publishingMode: requestedMode,
      },
    });

    const correlationId = `pub_mode_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Record Audit Event
    await auditService.recordEvent({
      tenantId: targetWorkspaceId || 'tenant-default',
      category: 'Publishing',
      severity: requestedMode === 'LIVE' ? 'warning' : 'info',
      action: 'publishing.mode.changed',
      details: `Workspace publishing mode switched from '${previousMode}' to '${requestedMode}'. Approved publishing actions will target ${requestedMode === 'LIVE' ? 'real connected platform APIs' : 'the simulated sandbox'}.`,
      entityType: 'PublishingPolicy',
      entityId: userId,
      userId: userId,
      correlationId,
      metadata: {
        workspaceId: targetWorkspaceId || 'tenant-default',
        actorId: userId,
        previousMode,
        newMode: requestedMode,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      mode: requestedMode,
      allowLivePublishing,
      correlationId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update publishing mode' }, { status: 500 });
  }
}
