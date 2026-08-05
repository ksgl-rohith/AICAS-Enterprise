import { z } from 'zod';

export const TrustLevelSchema = z.enum([
  'VERIFIED_INTERNAL',
  'GOVERNMENT_REGULATORY',
  'PRIMARY_RESEARCH',
  'THIRD_PARTY_MEDIA',
  'UNVERIFIED_EXTERNAL',
]);

export type TrustLevel = z.infer<typeof TrustLevelSchema>;

export const SourceTypeSchema = z.enum([
  'document',
  'website',
  'rss',
  'market_signal',
  'internal_policy',
  'database',
]);

export type SourceType = z.infer<typeof SourceTypeSchema>;

export const EvidenceRecordSchema = z.object({
  evidenceId: z.string(),
  sourceId: z.string(),
  sourceTitle: z.string(),
  sourceType: SourceTypeSchema,
  sourceUri: z.string().optional(),
  retrievedExcerpt: z.string(),
  publicationDate: z.string().optional(),
  retrievalDate: z.string(),
  trustLevel: TrustLevelSchema,
  tenantId: z.string(),
  brandId: z.string(),
  chunkId: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;

export interface EvidencePack {
  packId: string;
  tenantId: string;
  brandId: string;
  campaignId?: string;
  records: EvidenceRecord[];
  createdAt: string;
}

export function calculateEvidenceTrustWeight(trustLevel: TrustLevel): number {
  switch (trustLevel) {
    case 'VERIFIED_INTERNAL':
      return 1.0;
    case 'GOVERNMENT_REGULATORY':
      return 0.95;
    case 'PRIMARY_RESEARCH':
      return 0.9;
    case 'THIRD_PARTY_MEDIA':
      return 0.75;
    case 'UNVERIFIED_EXTERNAL':
      return 0.4;
    default:
      return 0.5;
  }
}
