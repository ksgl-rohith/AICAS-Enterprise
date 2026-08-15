import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditService } from '@/lib/services/audit-service';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized: Valid session required to access workspaces' }, { status: 401 });
    }

    const userId = session.userId;
    const dbUser = await db.user.findUnique({ where: { id: userId } });
    if (!dbUser || (dbUser.status && dbUser.status !== 'ACTIVE')) {
      return NextResponse.json({ error: 'Unauthorized: User not found or inactive' }, { status: 401 });
    }

    const isAdmin = dbUser.role === 'ADMIN' || session.role === 'ADMIN';

    // 1. Fetch real DB memberships for the authenticated user
    const memberships = await db.workspaceMembership.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });

    let authorizedWorkspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      code: m.workspace.code,
      description: m.workspace.description || `${m.workspace.name} Enterprise Workspace`,
      role: m.role,
    }));

    // 2. If Platform Admin, also include all other system workspaces
    if (isAdmin) {
      const allDbWorkspaces = await db.workspace.findMany({
        where: {
          id: { notIn: authorizedWorkspaces.map((w) => w.id) },
        },
        orderBy: { createdAt: 'asc' },
      });

      const additionalAdminWorkspaces = allDbWorkspaces.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        description: w.description || `${w.name} Workspace`,
        role: 'ADMIN',
      }));

      // Also include demo fixtures for admin testing
      const demoFixtures = [
        {
          id: 'tenant-default',
          name: 'ApexAI Enterprise (Demo Testbed)',
          code: 'DEMO-APEX',
          description: 'Isolated test environment for multi-agent experimentation and simulated publishing.',
          role: 'ADMIN',
        },
        {
          id: 'tenant-legal-002',
          name: 'Kandvate Legal Advisory (Demo)',
          code: 'DEMO-LAW',
          description: 'Legal & compliance advisory workspace for corporate dispute resolution.',
          role: 'ADMIN',
        },
      ];

      authorizedWorkspaces = [...authorizedWorkspaces, ...additionalAdminWorkspaces, ...demoFixtures];
    }

    // 3. Fallback for legacy seeded user if no DB workspace was created yet
    if (authorizedWorkspaces.length === 0) {
      // Auto-create personal workspace for existing user
      const userFirstName = dbUser.name.split(' ')[0] || 'My';
      const defaultWsName = `${userFirstName}'s Organization`;
      const defaultCode = `${userFirstName.toUpperCase().slice(0, 6)}-WS`;

      const newWs = await db.workspace.create({
        data: {
          name: defaultWsName,
          code: `${defaultCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          description: `Personal enterprise workspace for ${dbUser.name}.`,
        },
      });

      const newMembership = await db.workspaceMembership.create({
        data: {
          workspaceId: newWs.id,
          userId: dbUser.id,
          role: 'WORKSPACE_OWNER',
        },
      });

      authorizedWorkspaces = [
        {
          id: newWs.id,
          name: newWs.name,
          code: newWs.code,
          description: newWs.description || defaultWsName,
          role: newMembership.role,
        },
      ];
    }

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
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized: Valid session required to switch workspace' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const userId = session.userId;
    const userRole = session.role;
    const isAdmin = userRole === 'ADMIN';

    // Verify user is authorized for this workspace
    if (!isAdmin) {
      const membership = await db.workspaceMembership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      const isAllowedDemo = workspaceId === 'tenant-default';

      if (!membership && !isAllowedDemo) {
        return NextResponse.json(
          { error: 'Access denied: You are not an authorized member of the requested workspace.' },
          { status: 403 }
        );
      }
    }

    await auditService.recordEvent({
      tenantId: workspaceId,
      userId: userId,
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
