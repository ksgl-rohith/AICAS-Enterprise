import { db } from '@/lib/db';

export interface LearningScope {
  tenantId: string;
  brandId: string;
  campaignType?: string;
  audience?: string;
  channel?: string;
  locale?: string;
}

export interface CreateLearningParams {
  tenantId: string;
  brandId: string;
  learnedPreference: string;
  supportingEvidence: string[]; // evidence citations or experiment IDs
  confidence: number; // 0.0 - 1.0
  scope: LearningScope;
  expiryDays?: number;
  status?: 'PROPOSED' | 'TEMPORARY_OBSERVATION' | 'APPROVED_LEARNED_POLICY';
}

export class LearningMemoryService {
  private static instance: LearningMemoryService;

  private constructor() {}

  public static getInstance(): LearningMemoryService {
    if (!LearningMemoryService.instance) {
      LearningMemoryService.instance = new LearningMemoryService();
    }
    return LearningMemoryService.instance;
  }

  /**
   * Record a new proposed or temporary observation into Learning Memory.
   * Standard rules: Does NOT alter or overwrite immutable Brand rules.
   */
  public async createLearningItem(params: CreateLearningParams) {
    // Statistically credible or high confidence required for direct policy entry
    let status = params.status || 'PROPOSED';
    if (params.confidence < 0.70 && status === 'APPROVED_LEARNED_POLICY') {
      status = 'TEMPORARY_OBSERVATION';
    }

    const expiry = params.expiryDays
      ? new Date(Date.now() + params.expiryDays * 24 * 60 * 60 * 1000)
      : null;

    return await db.learningMemoryItem.create({
      data: {
        tenantId: params.tenantId,
        brandId: params.brandId,
        learnedPreference: params.learnedPreference,
        supportingEvidenceJson: JSON.stringify(params.supportingEvidence),
        confidence: params.confidence,
        scopeTenant: params.scope.tenantId,
        scopeBrand: params.scope.brandId,
        scopeCampaignType: params.scope.campaignType || null,
        scopeAudience: params.scope.audience || null,
        scopeChannel: params.scope.channel || null,
        scopeLocale: params.scope.locale || null,
        expiry,
        status,
      },
    });
  }

  /**
   * Approve a learned preference into APPROVED_LEARNED_POLICY.
   */
  public async approvePolicy(id: string, approverId: string) {
    const existing = await db.learningMemoryItem.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`Learning Memory Item ${id} not found.`);
    }

    return await db.learningMemoryItem.update({
      where: { id },
      data: {
        status: 'APPROVED_LEARNED_POLICY',
        approverId,
      },
    });
  }

  /**
   * Roll back a learned policy with rollback reference reason.
   */
  public async rollbackPolicy(id: string, rollbackRef: string) {
    return await db.learningMemoryItem.update({
      where: { id },
      data: {
        status: 'ROLLED_BACK',
        rollbackRef,
      },
    });
  }

  /**
   * Fetch approved learned policies for a given tenant, brand, and optional channel.
   * Ensures immutable brand settings remain separate.
   */
  public async getApprovedPolicies(tenantId: string, brandId: string, channel?: string) {
    const items = await db.learningMemoryItem.findMany({
      where: {
        tenantId,
        brandId,
        status: 'APPROVED_LEARNED_POLICY',
        ...(channel ? { OR: [{ scopeChannel: channel }, { scopeChannel: null }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.filter((item) => !item.expiry || new Date(item.expiry) > new Date());
  }
}

export const learningMemoryService = LearningMemoryService.getInstance();
