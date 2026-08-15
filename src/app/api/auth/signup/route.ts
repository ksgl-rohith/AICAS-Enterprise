import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signSessionPayload, setSessionCookie } from '@/lib/auth';
import { auditService } from '@/lib/services/audit-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateWorkspaceCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'WS';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const emailInput = (body.email || body.username || '').trim();
    const password = (body.password || '').trim();
    const confirmPassword = (body.confirmPassword || '').trim();
    const workspaceName = (body.workspaceName || body.organizationName || '').trim();
    const industry = (body.industry || 'Technology & Enterprise Solutions').trim();
    const website = (body.website || body.companyWebsite || '').trim();
    const companySize = (body.companySize || '50-250').trim();

    if (!name || !emailInput || !password) {
      return NextResponse.json(
        { error: 'Full Name, Work Email, and Password are required.' },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    const email = emailInput.toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    const effectiveWorkspaceName = workspaceName || `${name.split(' ')[0]}'s Organization`;

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Hash password with unique salt
    const passwordHash = hashPassword(password);
    const workspaceCode = generateWorkspaceCode(effectiveWorkspaceName);

    // Atomic transaction: Create User + Workspace + WorkspaceMembership + Preferences
    const result = await db.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'MARKETING_MANAGER',
          status: 'ACTIVE',
        },
      });

      // 2. Create Workspace
      const workspace = await tx.workspace.create({
        data: {
          name: effectiveWorkspaceName,
          code: workspaceCode,
          description: `${effectiveWorkspaceName} multi-agent campaign orchestration & governance workspace.`,
          industry,
          website: website || null,
          companySize: companySize || null,
        },
      });

      // 3. Create Owner Membership
      const membership = await tx.workspaceMembership.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'WORKSPACE_OWNER',
        },
      });

      // 4. Create User Preferences
      await tx.userPreferences.create({
        data: {
          userId: user.id,
          theme: 'system',
          density: 'comfortable',
          sidebarDefault: 'expanded',
          executionMode: 'mock',
          publishingMode: 'SIMULATED',
        },
      });

      return { user, workspace, membership };
    });

    const token = signSessionPayload({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        username: result.user.email.split('@')[0],
        role: result.user.role,
      },
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
        code: result.workspace.code,
        role: result.membership.role,
      },
    });

    setSessionCookie(response, token);

    await auditService.recordEvent({
      tenantId: result.workspace.id,
      category: 'Authentication',
      severity: 'info',
      action: 'user.signup',
      details: `New user '${result.user.email}' registered account and established workspace '${result.workspace.name}' (${result.workspace.code}).`,
      entityType: 'User',
      entityId: result.user.id,
      userId: result.user.id,
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Registration service error. Please try again.' }, { status: 500 });
  }
}
