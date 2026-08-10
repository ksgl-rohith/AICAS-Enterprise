import { BrandContextPackage } from './brand-context-package';

export interface IndustryDriftResult {
  primaryTopic: string;
  brandIndustry: string;
  relevanceType: 'MATCHING_INDUSTRY' | 'RELEVANT_ADJACENT' | 'UNRELATED_DRIFT';
  driftScore: number; // 0.0 (no drift) to 1.0 (severe drift)
  explanation: string;
  shouldBlock: boolean;
}

export class IndustryDriftDetector {
  /**
   * Evaluates if generated text has drifted away from the company's real industry & Brand DNA.
   */
  public detectDrift(
    textToEvaluate: string,
    pkg: BrandContextPackage
  ): IndustryDriftResult {
    const textLower = (textToEvaluate || '').toLowerCase();
    const industryLower = pkg.industry.toLowerCase();
    const isAiTechCompany =
      industryLower.includes('ai') ||
      industryLower.includes('software') ||
      industryLower.includes('tech') ||
      pkg.brandName.toLowerCase().includes('aicas');

    // Known unrelated tech/AI leak terms
    const aiTechLeakKeywords = [
      'multi-agent',
      'multi agent',
      'llm orchestration',
      'vector rag',
      'rag vector',
      'autonomous agent council',
      'agentic ai',
      'agent run',
    ];

    const hasAiTechLeakTerms = aiTechLeakKeywords.some((term) => textLower.includes(term));

    // Check if the brand's actual description/products mention these terms
    const brandMentionsAiTech =
      (pkg.description + ' ' + pkg.products.join(' ')).toLowerCase().includes('multi-agent') ||
      (pkg.description + ' ' + pkg.products.join(' ')).toLowerCase().includes('ai');

    let relevanceType: 'MATCHING_INDUSTRY' | 'RELEVANT_ADJACENT' | 'UNRELATED_DRIFT' = 'MATCHING_INDUSTRY';
    let driftScore = 0.0;
    let shouldBlock = false;
    let explanation = `Content aligns with brand industry (${pkg.industry}).`;

    // Severe Drift: Non-AI company receiving generic multi-agent tech copy
    if (!isAiTechCompany && !brandMentionsAiTech && hasAiTechLeakTerms) {
      relevanceType = 'UNRELATED_DRIFT';
      driftScore = 0.95;
      shouldBlock = true;
      explanation = `Industry Drift Blocked: Generated text contains unrelated software AI terms ('multi-agent systems') for a ${pkg.industry} brand. Content must reflect actual ${pkg.industry} business services.`;
      return {
        primaryTopic: 'Unrelated Software/AI Technology Leak',
        brandIndustry: pkg.industry,
        relevanceType,
        driftScore,
        explanation,
        shouldBlock,
      };
    }

    // Moderate Drift Check: No overlap with industry keywords or products
    const industryWords = industryLower.split(/[\s&/]+/).filter((w) => w.length > 3);
    const productWords = pkg.products.flatMap((p) => p.toLowerCase().split(/\s+/)).filter((w) => w.length > 3);
    const descWords = pkg.description.toLowerCase().split(/\s+/).filter((w) => w.length > 4);

    const hasIndustryOverlap = industryWords.some((w) => textLower.includes(w));
    const hasProductOverlap = productWords.some((w) => textLower.includes(w));
    const hasDescOverlap = descWords.some((w) => textLower.includes(w));

    if (!hasIndustryOverlap && !hasProductOverlap && !hasDescOverlap) {
      relevanceType = 'RELEVANT_ADJACENT';
      driftScore = 0.45;
      explanation = `Content topic is adjacent to ${pkg.industry}. Ensure brand products/services are explicitly cited.`;
    }

    return {
      primaryTopic: pkg.industry,
      brandIndustry: pkg.industry,
      relevanceType,
      driftScore,
      explanation,
      shouldBlock: false,
    };
  }
}

export const industryDriftDetector = new IndustryDriftDetector();
