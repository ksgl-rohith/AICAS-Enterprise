import { BrandContextPackage } from './brand-context-package';

export interface BrandRelevanceScores {
  overall: number; // 0.0 to 1.0
  businessRelevance: number;
  serviceRelevance: number;
  audienceRelevance: number;
  campaignAlignment: number;
  evidenceCoverage: number;
  status: 'PASS' | 'REVISE' | 'BLOCK';
  rationale: string;
}

export class BrandRelevanceGate {
  /**
   * Deterministic & Heuristic Brand Relevance Evaluation
   */
  public evaluateRelevance(
    contentTitleOrText: string,
    pkg: BrandContextPackage,
    campaignObjective?: string
  ): BrandRelevanceScores {
    const textLower = (contentTitleOrText || '').toLowerCase();
    
    // 1. Business Relevance: Checks overlap with brand name, industry, and description keywords
    const brandNameLower = pkg.brandName.toLowerCase();
    const industryLower = pkg.industry.toLowerCase();
    const descWords = pkg.description.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const descMatches = descWords.filter((w) => textLower.includes(w)).length;
    
    let businessRelevance = 0.5;
    if (textLower.includes(brandNameLower) || textLower.includes(industryLower)) {
      businessRelevance = 0.85;
    }
    if (descWords.length > 0) {
      const matchRatio = descMatches / descWords.length;
      businessRelevance = Math.min(1.0, businessRelevance + matchRatio * 0.3);
    }

    // 2. Service / Product Relevance: Checks overlap with brand's specific products/services
    let serviceRelevance = 0.4;
    if (pkg.products.length > 0) {
      const productMatches = pkg.products.filter((prod) => textLower.includes(prod.toLowerCase()));
      if (productMatches.length > 0) {
        serviceRelevance = 0.90;
      }
    }
    if (pkg.preferredVocabulary.length > 0) {
      const vocabMatches = pkg.preferredVocabulary.filter((v) => textLower.includes(v.toLowerCase()));
      if (vocabMatches.length > 0) {
        serviceRelevance = Math.min(1.0, serviceRelevance + 0.15);
      }
    }

    // 3. Target Audience Relevance
    let audienceRelevance = 0.6;
    if (pkg.targetAudience) {
      const audWords = pkg.targetAudience.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 3);
      const audMatches = audWords.filter((w) => textLower.includes(w)).length;
      if (audMatches > 0) {
        audienceRelevance = 0.88;
      }
    }

    // 4. Campaign Alignment
    let campaignAlignment = 0.75;
    if (campaignObjective) {
      const objLower = campaignObjective.toLowerCase().replace(/_/g, ' ');
      if (textLower.includes(objLower)) {
        campaignAlignment = 0.95;
      }
    }

    // 5. Evidence Coverage
    let evidenceCoverage = 0.5;
    if (pkg.groundedChunks.length > 0) {
      const chunkMatchCount = pkg.groundedChunks.filter((chunk) => {
        const words = chunk.content.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
        return words.some((w) => textLower.includes(w));
      }).length;
      if (chunkMatchCount > 0) {
        evidenceCoverage = Math.min(1.0, 0.70 + (chunkMatchCount / pkg.groundedChunks.length) * 0.30);
      }
    }

    const weightedSum =
      businessRelevance * 0.30 +
      serviceRelevance * 0.25 +
      audienceRelevance * 0.20 +
      campaignAlignment * 0.15 +
      evidenceCoverage * 0.10;

    const overall = Math.round(weightedSum * 100) / 100;

    let status: 'PASS' | 'REVISE' | 'BLOCK' = 'PASS';
    if (overall < 0.70) {
      status = 'BLOCK';
    } else if (overall < 0.85) {
      status = 'REVISE';
    }

    const rationale = `Evaluated brand relevance score ${overall.toFixed(2)} (${status}). Business: ${businessRelevance.toFixed(2)}, Service: ${serviceRelevance.toFixed(2)}, Audience: ${audienceRelevance.toFixed(2)}, Evidence: ${evidenceCoverage.toFixed(2)}.`;

    return {
      overall,
      businessRelevance,
      serviceRelevance,
      audienceRelevance,
      campaignAlignment,
      evidenceCoverage,
      status,
      rationale,
    };
  }
}

export const brandRelevanceGate = new BrandRelevanceGate();
