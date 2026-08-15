import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, clearSessionCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    const res = NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    clearSessionCookie(res);
    return res;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user || (user.status && user.status !== 'ACTIVE')) {
      const res = NextResponse.json({ authenticated: false, user: null }, { status: 401 });
      clearSessionCookie(res);
      return res;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.email.split('@')[0],
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
