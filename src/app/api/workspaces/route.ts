import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditService } from '@/lib/services/audit-service';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const userId = session?.userId;
    const userRole = session?.role || 'MARKETING_MANAGER';

    // Fetch user from DB
    let dbUser = userId ? await db.user.findUnique({ where: { id: userId } }) : null;
    if (!dbUser) {
      dbUser = await db.user.findFirst();
    }

    const isAdmin = dbUser?.role === 'ADMIN' || userRole === 'ADMIN';

    // In AICAS Enterprise multi-tenant system:
    // Admins get access to all active tenant workspaces.
    // Normal users get access to their assigned workspace(s).
    const defaultWorkspaces = [
      {
        id: 'tenant-default',
        name: 'ApexAI Enterprise Workspace',
        code: 'APEX-ENT',
        description: 'Primary enterprise tenant workspace for AI content orchestration & governance.',
        role: isAdmin ? 'ADMIN' : 'MANAGER',
      },
      {
        id: 'tenant-legal-002',
        name: 'Kandvate Legal Advisory Workspace',
        code: 'KANDVATE-LAW',
        description: 'Legal & compliance advisory workspace for corporate dispute resolution & contracts.',
        role: isAdmin ? 'ADMIN' : 'MEMBER',
      },
      {
        id: 'tenant-demo-003',
        name: 'Sandbox Demo Workspace',
        code: 'DEMO-SANDBOX',
        description: 'Isolated test environment for multi-agent experimentation and simulated publishing.',
        role: isAdmin ? 'ADMIN' : 'MEMBER',
      },
    ];

    // Filter available workspaces for normal user vs admin
    const authorizedWorkspaces = isAdmin
      ? defaultWorkspaces
      : defaultWorkspaces.slice(0, 1); // Normal user assigned to primary workspace

    return NextResponse.json({
      success: true,
      workspaces: authorizedWorkspaces,
      isAdmin,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch authorized workspaces' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const userId = session?.userId;
    const userRole = session?.role;
    const isAdmin = userRole === 'ADMIN';

    // Verify authorized workspace access
    const validIds = ['tenant-default', 'tenant-legal-002', 'tenant-demo-003'];
    if (!validIds.includes(workspaceId)) {
      return NextResponse.json({ error: 'Unauthorized or invalid workspace requested.' }, { status: 403 });
    }

    if (!isAdmin && workspaceId !== 'tenant-default') {
      return NextResponse.json({ error: 'Access denied. You are only authorized to access assigned workspace tenant-default.' }, { status: 403 });
    }

    await auditService.recordEvent({
      tenantId: workspaceId,
      userId: userId || undefined,
      category: 'Administration',
      action: 'workspace.selected',
      details: `User switched active workspace context to '${workspaceId}'.`,
      entityType: 'Workspace',
      entityId: workspaceId,
    });

    return NextResponse.json({
      success: true,
      activeWorkspaceId: workspaceId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to switch active workspace' }, { status: 500 });
  }
}
