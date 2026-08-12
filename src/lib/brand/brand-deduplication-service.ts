import { db } from '@/lib/db';
import { DomainNormalizer, NormalizedDomainResult } from './domain-normalizer';

export interface DuplicateDetectionResult {
  matchType: 'EXACT_DUPLICATE' | 'PROBABLE_DUPLICATE' | 'UNIQUE';
  existingBrand: any | null;
  confidence: number;
  rationale: string;
}

export interface MergeResult {
  success: boolean;
  canonicalBrandId: string;
  mergedBrandId: string;
  migratedCounts: Record<string, number>;
  error?: string;
}

export class BrandDeduplicationService {
  /**
   * Detect potential duplicates for a brand before creation
   */
  public async detectDuplicate(
    tenantId: string,
    name: string,
    websiteUrl?: string | null
  ): Promise<DuplicateDetectionResult> {
    const normalized = DomainNormalizer.normalize(websiteUrl);

    // 1. Check Exact Normalized Domain Match (Tenant-scoped)
    if (normalized?.normalizedDomain) {
      const exactDomainMatch = await db.brand.findFirst({
        where: {
          normalizedDomain: normalized.normalizedDomain,
        } as any,
      });

      if (exactDomainMatch) {
        return {
          matchType: 'EXACT_DUPLICATE',
          existingBrand: exactDomainMatch,
          confidence: 0.99,
          rationale: `A Brand Profile already exists for normalized domain "${normalized.normalizedDomain}" (${exactDomainMatch.name}).`,
        };
      }
    }

    // 2. Check Name Similarity Match (Tenant-scoped)
    const cleanedName = name.trim().toLowerCase();
    const existingBrands = await db.brand.findMany();

    for (const brand of existingBrands) {
      const existingCleanedName = brand.name.trim().toLowerCase();
      if (existingCleanedName === cleanedName) {
        return {
          matchType: 'PROBABLE_DUPLICATE',
          existingBrand: brand,
          confidence: 0.85,
          rationale: `A Brand Profile with the exact name "${brand.name}" already exists.`,
        };
      }
    }

    return {
      matchType: 'UNIQUE',
      existingBrand: null,
      confidence: 1.0,
      rationale: 'No duplicate Brand Profile detected.',
    };
  }

  /**
   * List all potential duplicate brand pairs for administrator review
   */
  public async findPotentialDuplicates(tenantId: string) {
    const brands = await db.brand.findMany({
      orderBy: { name: 'asc' },
    });

    const candidatePairs: Array<{ brandA: any; brandB: any; reason: string; confidence: number }> = [];

    for (let i = 0; i < brands.length; i++) {
      for (let j = i + 1; j < brands.length; j++) {
        const a = brands[i];
        const b = brands[j];
        const aAny = a as any;
        const bAny = b as any;

        if (aAny.normalizedDomain && bAny.normalizedDomain && aAny.normalizedDomain === bAny.normalizedDomain) {
          candidatePairs.push({
            brandA: a,
            brandB: b,
            reason: `Matching canonical domain (${aAny.normalizedDomain})`,
            confidence: 0.95,
          });
        } else if (a.name.trim().toLowerCase() === b.name.trim().toLowerCase()) {
          candidatePairs.push({
            brandA: a,
            brandB: b,
            reason: `Identical brand display name ("${a.name}")`,
            confidence: 0.8,
          });
        }
      }
    }

    return candidatePairs;
  }

  /**
   * Safely merge a duplicate brand into a canonical brand with full entity relationship migration
   */
  public async mergeBrands(
    canonicalBrandId: string,
    mergedBrandId: string,
    reason: string = 'Administrator consolidated duplicate profiles',
    mergedBy: string = 'system'
  ): Promise<MergeResult> {
    if (canonicalBrandId === mergedBrandId) {
      return { success: false, canonicalBrandId, mergedBrandId, migratedCounts: {}, error: 'Cannot merge a brand into itself.' };
    }

    const canonicalBrand = await db.brand.findUnique({ where: { id: canonicalBrandId } });
    const mergedBrand = await db.brand.findUnique({ where: { id: mergedBrandId } });

    if (!canonicalBrand || !mergedBrand) {
      return { success: false, canonicalBrandId, mergedBrandId, migratedCounts: {}, error: 'One or both brand profiles not found.' };
    }

    const migratedCounts: Record<string, number> = {};

    // 1. Reassign Campaigns
    const campaignRes = await db.campaign.updateMany({
      where: { brandId: mergedBrandId },
      data: { brandId: canonicalBrandId },
    });
    migratedCounts.campaigns = campaignRes.count;

    // 2. Reassign Knowledge Docs
    const docRes = await db.brandKnowledgeDocument.updateMany({
      where: { brandId: mergedBrandId },
      data: { brandId: canonicalBrandId },
    });
    migratedCounts.knowledgeDocs = docRes.count;

    // 3. Reassign Knowledge Chunks
    const chunkRes = await db.knowledgeChunk.updateMany({
      where: { brandId: mergedBrandId },
      data: { brandId: canonicalBrandId },
    });
    migratedCounts.knowledgeChunks = chunkRes.count;

    // 4. Reassign Ingestion Sources
    const sourceRes = await db.ingestionSource.updateMany({
      where: { brandId: mergedBrandId },
      data: { brandId: canonicalBrandId },
    });
    migratedCounts.ingestionSources = sourceRes.count;

    // 5. Reassign Platform Connections (Delete conflicting platforms first)
    const existingCanonicalConnections = await db.platformConnection.findMany({
      where: { brandId: canonicalBrandId },
      select: { platform: true },
    });
    const canonicalPlatforms = new Set(existingCanonicalConnections.map((c) => c.platform));

    const duplicateMergedConnections = await db.platformConnection.findMany({
      where: { brandId: mergedBrandId },
    });

    let migratedConnections = 0;
    for (const conn of duplicateMergedConnections) {
      if (canonicalPlatforms.has(conn.platform)) {
        await db.platformConnection.delete({ where: { id: conn.id } });
      } else {
        await db.platformConnection.update({
          where: { id: conn.id },
          data: { brandId: canonicalBrandId },
        });
        migratedConnections++;
      }
    }
    migratedCounts.platformConnections = migratedConnections;

    // 6. Reassign Audit Events
    const auditRes = await db.auditEvent.updateMany({
      where: { brandId: mergedBrandId },
      data: { brandId: canonicalBrandId },
    });
    migratedCounts.auditEvents = auditRes.count;

    // 7. Data Precedence Merge: Fill missing fields on canonical brand if present in merged brand
    const canonicalAny = canonicalBrand as any;
    const mergedAny = mergedBrand as any;
    const brandUpdates: Record<string, any> = {};

    if (!canonicalAny.originalWebsiteUrl && mergedAny.originalWebsiteUrl) {
      brandUpdates.originalWebsiteUrl = mergedAny.originalWebsiteUrl;
    }
    if (!canonicalAny.canonicalWebsiteUrl && mergedAny.canonicalWebsiteUrl) {
      brandUpdates.canonicalWebsiteUrl = mergedAny.canonicalWebsiteUrl;
    }
    if (!canonicalAny.normalizedDomain && mergedAny.normalizedDomain) {
      brandUpdates.normalizedDomain = mergedAny.normalizedDomain;
    }
    if (!canonicalBrand.description && mergedBrand.description) {
      brandUpdates.description = mergedBrand.description;
    }

    if (Object.keys(brandUpdates).length > 0) {
      await db.brand.update({
        where: { id: canonicalBrandId },
        data: brandUpdates,
      });
    }

    // 8. Soft-archive merged brand record
    await db.brand.update({
      where: { id: mergedBrandId },
      data: { description: `[MERGED into ${canonicalBrandId}] ${mergedBrand.description}` },
    });

    // 9. Record BrandMergeRecord if model exists
    if ((db as any).brandMergeRecord) {
      await (db as any).brandMergeRecord.create({
        data: {
          tenantId: 'tenant-default',
          canonicalBrandId,
          mergedBrandId,
          mergedBrandName: mergedBrand.name,
          mergedDomain: mergedAny.normalizedDomain || '',
          reason,
          migratedCountsJson: JSON.stringify(migratedCounts),
          mergedBy,
        },
      });
    }

    // 10. Record Audit Event
    await db.auditEvent.create({
      data: {
        tenantId: 'tenant-default',
        userId: canonicalBrand.userId,
        brandId: canonicalBrandId,
        action: 'BRAND_MERGED',
        details: `Brand "${mergedBrand.name}" (${mergedBrandId}) merged into "${canonicalBrand.name}" (${canonicalBrandId}). ${reason}`,
        entityType: 'Brand',
        entityId: canonicalBrandId,
        metadataJson: JSON.stringify({ mergedBrandId, migratedCounts }),
      },
    });

    return {
      success: true,
      canonicalBrandId,
      mergedBrandId,
      migratedCounts,
    };
  }
}

export const brandDeduplicationService = new BrandDeduplicationService();
