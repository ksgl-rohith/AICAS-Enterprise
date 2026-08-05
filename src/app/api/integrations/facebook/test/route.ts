import { facebookConnector } from '@/lib/connectors/facebook-connector';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandId } = body;

    if (!brandId) {
      return NextResponse.json({ error: 'brandId required' }, { status: 400 });
    }

    const result = await facebookConnector.testConnection(brandId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
