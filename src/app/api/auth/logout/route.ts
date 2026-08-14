import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getSessionFromRequest } from '@/lib/auth';
import { auditService } from '@/lib/services/audit-service';

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  clearSessionCookie(response);

  if (session) {
    await auditService.recordEvent({
      category: 'Authentication',
      severity: 'info',
      action: 'user.logout',
      details: `User '${session.email}' logged out.`,
      entityType: 'User',
      entityId: session.userId,
      userId: session.userId,
    });
  }

  return response;
}
