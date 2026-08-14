import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, signSessionPayload, setSessionCookie } from '@/lib/auth';
import { auditService } from '@/lib/services/audit-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const username = (body.username || '').trim();
    const emailInput = (body.email || '').trim();
    const password = (body.password || '').trim();

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Name, Username, and Password are required.' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters long.' }, { status: 400 });
    }

    const email = emailInput
      ? emailInput.toLowerCase()
      : `${username.toLowerCase()}@aicas.ai`;

    const user = await getOrCreateUser(email, name, 'MARKETING_MANAGER');

    const token = signSessionPayload({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

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

    setSessionCookie(response, token);

    await auditService.recordEvent({
      category: 'Authentication',
      severity: 'info',
      action: 'user.signup',
      details: `New user '${user.email}' registered account successfully.`,
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Registration service error.' }, { status: 500 });
  }
}
