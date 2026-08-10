import { BrandContextPackage } from './brand-context-package';

export interface BrandContextReadinessResult {
  readinessScore: number; // 0.0 to 1.0
  sufficientForGeneration: boolean;
  missingFields: string[];
  warnings: string[];
  evidenceSourceCount: number;
  recommendation: string;
}

export class BrandContextReadinessGate {
  private readonly minThreshold = 0.70;

  public evaluateReadiness(pkg: BrandContextPackage | null): BrandContextReadinessResult {
    if (!pkg) {
      return {
        readinessScore: 0,
        sufficientForGeneration: false,
        missingFields: ['Brand Profile Record'],
        warnings: ['Brand DNA profile does not exist in database.'],
        evidenceSourceCount: 0,
        recommendation: 'Please select a valid brand or create a new Brand Profile.',
      };
    }

    const missingFields: string[] = [];
    const warnings: string[] = [];
    let score = 0.0;

    // 1. Identity & Name (20%)
    if (pkg.brandName && pkg.brandName.trim().length > 1) {
      score += 0.20;
    } else {
      missingFields.push('Brand Name');
    }

    // 2. Industry Classification (15%)
    if (pkg.industry && pkg.industry.trim().length > 2) {
      score += 0.15;
    } else {
      missingFields.push('Industry Domain');
    }

    // 3. Business & Brand Overview (20%)
    if (pkg.description && pkg.description.trim().length >= 25) {
      score += 0.20;
    } else if (pkg.description && pkg.description.trim().length > 0) {
      score += 0.10;
      warnings.push('Brand description is brief. Consider adding more detail on your core value proposition.');
    } else {
      missingFields.push('Company Overview Description');
    }

    // 4. Products & Services (15%)
    if (pkg.products && pkg.products.length > 0) {
      score += 0.15;
    } else {
      missingFields.push('Products / Offerings List');
    }

    // 5. Target Audience Persona (10%)
    if (pkg.targetAudience && pkg.targetAudience.trim().length > 3) {
      score += 0.10;
    } else {
      missingFields.push('Target Audience Persona');
    }

    // 6. Knowledge Base Documents / Web Chunks (10%)
    const evidenceSourceCount = pkg.documentCount + pkg.groundedChunks.length;
    if (evidenceSourceCount > 0) {
      score += 0.10;
    } else {
      warnings.push('No uploaded whitepapers or crawled website pages found for vector grounding.');
    }

    // 7. Tone & Governance Rules (10%)
    if (pkg.tone || pkg.personality) {
      score += 0.10;
    } else {
      missingFields.push('Brand Tone & Voice Rules');
    }

    const readinessScore = Math.min(1.0, Math.round(score * 100) / 100);
    const sufficientForGeneration = readinessScore >= this.minThreshold;

    let recommendation = 'Brand context is complete and ready for high-confidence campaign generation.';
    if (!sufficientForGeneration) {
      recommendation = `Brand context score (${Math.round(readinessScore * 100)}%) is below the required ${Math.round(this.minThreshold * 100)}% threshold. Additional company information is required before high-confidence content can be generated. Missing: ${missingFields.join(', ')}.`;
    }

    return {
      readinessScore,
      sufficientForGeneration,
      missingFields,
      warnings,
      evidenceSourceCount,
      recommendation,
    };
  }
}

export const brandContextReadinessGate = new BrandContextReadinessGate();
