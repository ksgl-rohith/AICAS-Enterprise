import { db } from '@/lib/db';

export type FieldSource = 'HUMAN_CONFIRMED' | 'HIGH_CONFIDENCE_APPROVED_SOURCE' | 'AI_EXTRACTED' | 'DOMAIN_FALLBACK';

export interface PrecedenceField<T> {
  value: T;
  source: FieldSource;
  updatedAt: string;
}

export interface StoredBrandDNA {
  brandId: string;
  identity: {
    name: PrecedenceField<string>;
    industry: PrecedenceField<string>;
    description: PrecedenceField<string>;
  };
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
