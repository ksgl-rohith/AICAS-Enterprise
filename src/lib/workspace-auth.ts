import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, UserSessionPayload } from '@/lib/auth';
import { db } from '@/lib/db';

export interface WorkspaceAuthResult {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  workspaceId: string;
  workspace: {
    id: string;
    name: string;
    code: string;
    description: string | null;
  };
  role: string;
  isAdmin: boolean;
}

export class WorkspaceAuthError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Centrally resolve and authorize the active workspace for any incoming server/API request.
 * Guarantees that:
 * 1. User is authenticated with an ACTIVE database record.
 * 2. If a specific workspaceId is requested (via query, body, or param), the user MUST have a valid
 *    WorkspaceMembership record for it (or be a Platform Admin).
 * 3. If no workspaceId is requested, the user's primary/active membership is resolved.
 * 4. Never blindly trusts client-provided workspace IDs.
 */
export async function resolveAuthorizedWorkspace(
  req: NextRequest | Request,
  requestedWorkspaceId?: string | null
): Promise<WorkspaceAuthResult> {
  // 1. Extract session from cookies / Bearer token
  let session: UserSessionPayload | null = null;
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    session = getSessionFromRequest(req as NextRequest);
  } else {
    // Standard Request - extract from headers
    const cookieHeader = req.headers.get('cookie') || '';
    const authHeader = req.headers.get('authorization') || '';
    const syntheticReq = new NextRequest('http://localhost:3000', {
      headers: { cookie: cookieHeader, authorization: authHeader },
    });
    session = getSessionFromRequest(syntheticReq);
  }

  if (!session || !session.userId) {
    throw new WorkspaceAuthError('Unauthorized: Authentication session required', 401);
  }

  // 2. Fetch User strictly from database
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new WorkspaceAuthError('Unauthorized: User not found or inactive', 401);
  }

  const isAdmin = user.role === 'ADMIN' || session.role === 'ADMIN';

  // 3. If specific workspace is requested, verify authorization
  const cleanRequestedId = requestedWorkspaceId ? requestedWorkspaceId.trim() : null;

  if (cleanRequestedId) {
    if (isAdmin) {
      const targetWs = await db.workspace.findUnique({
        where: { id: cleanRequestedId },
      });

      if (targetWs) {
        return {
          userId: user.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
          workspaceId: targetWs.id,
          workspace: targetWs,
          role: 'ADMIN',
          isAdmin: true,
        };
      }
    }

    // Check membership
    const membership = await db.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: cleanRequestedId,
          userId: user.id,
        },
      },
      include: { workspace: true },
    });

    if (!membership) {
      throw new WorkspaceAuthError(
        `Forbidden: You are not an authorized member of workspace "${cleanRequestedId}"`,
        403
      );
    }

    return {
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      workspaceId: membership.workspace.id,
      workspace: membership.workspace,
      role: membership.role,
      isAdmin,
    };
  }

  // 4. If no workspace specified, resolve user's primary workspace membership
  const primaryMembership = await db.workspaceMembership.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });

  if (primaryMembership) {
    return {
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      workspaceId: primaryMembership.workspace.id,
      workspace: primaryMembership.workspace,
      role: primaryMembership.role,
      isAdmin,
    };
  }

  // 5. Fallback: Auto-create personal workspace for user if none exists
  const userFirstName = user.name.split(' ')[0] || 'My';
  const defaultWsName = `${userFirstName}'s Organization`;
  const defaultCode = `${userFirstName.toUpperCase().slice(0, 6)}-WS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const newWs = await db.workspace.create({
    data: {
      name: defaultWsName,
      code: defaultCode,
      description: `Personal enterprise workspace for ${user.name}.`,
    },
  });

  const newMembership = await db.workspaceMembership.create({
    data: {
      workspaceId: newWs.id,
      userId: user.id,
      role: 'WORKSPACE_OWNER',
    },
  });

  return {
    userId: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    workspaceId: newWs.id,
    workspace: newWs,
    role: newMembership.role,
    isAdmin,
  };
}

/**
 * Helper to handle workspace auth error and return proper JSON response
 */
export function handleWorkspaceAuthError(error: any): NextResponse {
  const statusCode = error instanceof WorkspaceAuthError ? error.statusCode : 500;
  const message = error?.message || 'Workspace authorization error';
  return NextResponse.json({ error: message }, { status: statusCode });
}
