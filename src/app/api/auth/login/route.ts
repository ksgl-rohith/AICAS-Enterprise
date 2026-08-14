import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, signSessionPayload, setSessionCookie } from '@/lib/auth';
import { auditService } from '@/lib/services/audit-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = (body.username || body.email || '').trim();
    const password = (body.password || '').trim();
    const rememberMe = Boolean(body.remember);

    if (!username || !password) {
      return NextResponse.json({ error: 'Username/Email and Password are required.' }, { status: 400 });
    }

    const isDefaultAdmin = (username === 'admin' || username === 'admin@aicas.ai') && password === 'admin@123';
    const isValidStandard = password.length >= 4;

    if (!isDefaultAdmin && !isValidStandard) {
      return NextResponse.json({ error: 'Invalid credentials. Password must be at least 4 characters.' }, { status: 401 });
    }

    const email = username.includes('@')
      ? username.toLowerCase()
      : isDefaultAdmin
      ? 'admin@aicas.ai'
      : `${username.toLowerCase()}@aicas.ai`;

    const name = isDefaultAdmin ? 'AICAS TEAM' : username.split('@')[0];
    const role = isDefaultAdmin ? 'ADMIN' : 'MARKETING_MANAGER';

    const user = await getOrCreateUser(email, name, role);

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
      },
    });

    setSessionCookie(response, token, rememberMe);

    // Record login audit event
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication service error.' }, { status: 500 });
  }
}
