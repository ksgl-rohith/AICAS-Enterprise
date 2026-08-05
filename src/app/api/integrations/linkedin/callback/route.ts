import { verifyOAuthState } from '@/lib/crypto';
import { linkedinConnector } from '@/lib/connectors/linkedin-connector';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=${encodeURIComponent(errorDesc || error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=${encodeURIComponent('Missing OAuth code or state parameter.')}`);
  }

  const stateVerification = verifyOAuthState(state);
  if (!stateVerification.valid || !stateVerification.brandId) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=${encodeURIComponent('Invalid or expired OAuth state parameter.')}`);
  }

  const result = await linkedinConnector.exchangeAuthCode(stateVerification.brandId, code);

  if (!result.success) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=${encodeURIComponent(result.error || 'LinkedIn OAuth exchange failed.')}`);
  }

  return NextResponse.redirect(`${appUrl}/settings/integrations?success=linkedin&account=${encodeURIComponent(result.accountName || '')}`);
}
