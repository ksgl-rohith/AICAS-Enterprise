import { db } from '@/lib/db';
import { generateOAuthState } from '@/lib/crypto';
import { facebookConnector } from '@/lib/connectors/facebook-connector';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let brandId = searchParams.get('brandId');

    if (!brandId) {
      const firstBrand = await db.brand.findFirst();
      brandId = firstBrand?.id || '';
    }

    if (!brandId) {
      return NextResponse.json({ error: 'No brand found. Create a brand profile first.' }, { status: 400 });
    }

    const state = generateOAuthState(brandId, 'facebook');
    const authUrl = facebookConnector.getAuthUrl(state);

    return NextResponse.json({ authUrl, state });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
