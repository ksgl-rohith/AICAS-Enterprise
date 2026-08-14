import { db } from '@/lib/db';

export type FieldSource = 'HUMAN_CONFIRMED' | 'HIGH_CONFIDENCE_APPROVED_SOURCE' | 'AI_EXTRACTED' | 'DOMAIN_FALLBACK';

export interface PrecedenceField<T> {
  value: T;
  source: FieldSource;
  confidence?: number;
  updatedAt: string;
}

export interface BrandVoiceDimensions {
  personalityTraits: string[];
  tone: string;
  sentenceStyle: string;
  vocabularyStyle: string;
  technicalDepth: string;
  emotionalRange: string;
  authorityLevel: string;
  formality: string;
  preferredExpressions: string[];
  avoidedExpressions: string[];
  audienceAdaptation: string;
}

export type BrandRuleCategory =
  | 'preferred_terminology'
  | 'claims_restrictions'
  | 'cta_style'
  | 'tone_boundaries'
  | 'product_naming'
  | 'audience_sensitivity'
  | 'regulatory'
  | 'formatting'
  | 'disclaimers'
  | 'prohibited_promises';

export interface CategorizedBrandRule {
  id: string;
  rule: string;
  reason: string;
  evidence: string;
  confidence: number;
  category: BrandRuleCategory;
  source: FieldSource;
}

export interface StoredBrandDNA {
  brandId: string;
  identity: {
    name: PrecedenceField<string>;
    industry: PrecedenceField<string>;
    description: PrecedenceField<string>;
  };
  voice: PrecedenceField<BrandVoiceDimensions>;
  rules: CategorizedBrandRule[];
  offerings: PrecedenceField<string[]>;
  targetAudience: PrecedenceField<string>;
  prohibitedPhrases: PrecedenceField<string[]>;
  requiredDisclaimers: PrecedenceField<string[]>;
  defaultCTA: PrecedenceField<string>;
}

export class BrandDNARepository {
  /**
   * Determine precedence rank: lower number = higher precedence
   */
  private getPrecedenceRank(source: FieldSource): number {
    switch (source) {
      case 'HUMAN_CONFIRMED':
        return 1;
      case 'HIGH_CONFIDENCE_APPROVED_SOURCE':
        return 2;
      case 'AI_EXTRACTED':
        return 3;
      case 'DOMAIN_FALLBACK':
      default:
        return 4;
    }
  }

  /**
   * Resolve field value respecting precedence hierarchy.
   * If incoming source has lower precedence than existing human confirmed data, retain existing.
   */
  public resolvePrecedence<T>(
    existing: PrecedenceField<T> | undefined,
    incoming: PrecedenceField<T>
  ): PrecedenceField<T> {
    if (!existing) return incoming;

    const existingRank = this.getPrecedenceRank(existing.source);
    const incomingRank = this.getPrecedenceRank(incoming.source);

    // HUMAN_CONFIRMED strictly wins over AI_EXTRACTED or DOMAIN_FALLBACK
    if (existingRank < incomingRank) {
      return existing;
    }

    return incoming;
  }
}

export const brandDNARepository = new BrandDNARepository();
