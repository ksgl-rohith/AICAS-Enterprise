import { NextResponse } from 'next/server';
import { websiteBrandIntelligenceAgent } from '@/lib/ai/website-brand-intelligence-agent';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'Website URL parameter is required.' }, { status: 400 });
    }

    const intel = await websiteBrandIntelligenceAgent.extractBrandIntelligence(url.trim(), 'tenant-default');

    // Return extracted fields for UI auto-fill & evidence popovers
    return NextResponse.json({
      extractedData: {
        name: intel.identity.name.value,
        industry: intel.identity.industry.value,
        description: intel.identity.description.value,
        products: intel.productsAndServices.products.value.join(', '),
        targetAudience: intel.audience.targetAudience.value,
        personality: intel.voiceAndGovernance.personality.value,
        tone: intel.voiceAndGovernance.tone.value,
        preferredVocabulary: intel.voiceAndGovernance.preferredVocabulary.value.join(', '),
        prohibitedPhrases: intel.voiceAndGovernance.prohibitedPhrases.value.join(', '),
        requiredDisclaimers: intel.voiceAndGovernance.requiredDisclaimers.value.join('\n'),
        defaultCTA: intel.voiceAndGovernance.defaultCTA.value,
      },
      intelligence: intel,
    });
  } catch (error: any) {
    console.error('[ingest-url] Extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract website Brand DNA intelligence.' },
      { status: 400 }
    );
  }
}
