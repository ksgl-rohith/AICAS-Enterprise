import { NextResponse } from 'next/server';
import { apiCredentialsService } from '@/lib/connectors/api-credentials-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    // Approved schemas
    const schemas = apiCredentialsService.getApprovedSchemas(category);
    // Configured credentials (with secrets masked!)
    const configured = await apiCredentialsService.getCredentials('tenant-default');

    return NextResponse.json({
      schemas,
      configured,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch credentials' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, provider, name, values, action } = body;

    if (action === 'test') {
      const testRes = await apiCredentialsService.testConnection('tenant-default', category, provider);
      return NextResponse.json(testRes);
    }

    if (action === 'revoke') {
      const revokeRes = await apiCredentialsService.revokeCredential('tenant-default', category, provider);
      return NextResponse.json(revokeRes);
    }

    if (!category || !provider || !values) {
      return NextResponse.json({ error: 'Missing required parameters: category, provider, values' }, { status: 400 });
    }

    const saved = await apiCredentialsService.saveCredential({
      tenantId: 'tenant-default',
      category,
      provider,
      name,
      values,
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save credential' }, { status: 400 });
  }
}
