import { NextRequest, NextResponse } from 'next/server';
import { generateExportPackage } from '@/lib/connectors/export-package';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentItemId = params.id;
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') || 'linkedin';

    const exportPackage = await generateExportPackage(contentItemId, platform);

    return NextResponse.json({
      success: true,
      exportPackage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
