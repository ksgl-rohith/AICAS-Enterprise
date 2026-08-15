import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signSessionPayload, setSessionCookie } from '@/lib/auth';
import { auditService } from '@/lib/services/audit-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.email || body.username || '').trim();
    const password = (body.password || '').trim();
    const rememberMe = Boolean(body.remember);

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and Password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = identifier.includes('@')
      ? identifier.toLowerCase()
      : `${identifier.toLowerCase()}@aicas.ai`;

    // 1. Query user from database strictly by email
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 2. Reject if user does not exist
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 3. Reject if user is disabled or inactive
    if (user.status && user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is disabled. Please contact your workspace administrator.' },
        { status: 403 }
      );
    }

    // 4. Verify password against stored PBKDF2 hash
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 5. Create cryptographically signed session token
    const token = signSessionPayload(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      rememberMe
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.email.split('@')[0],
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    // 6. Set HttpOnly session cookie
    setSessionCookie(response, token, rememberMe);

    // 7. Record login audit event
    await auditService.recordEvent({
      category: 'Authentication',
      severity: 'info',
      action: 'user.login',
      details: `User '${user.email}' logged in successfully as ${user.role}.`,
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
    });

    return response;
  } catch (error: any) {
    console.error('Login service error:', error);
    return NextResponse.json(
      { error: 'Authentication service error. Please try again.' },
      { status: 500 }
    );
  }
}
