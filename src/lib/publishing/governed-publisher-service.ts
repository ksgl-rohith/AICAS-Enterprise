import { connectorCapabilityRegistry } from '@/lib/connectors/connector-capability-registry';
import { publishingRouter } from '@/lib/connectors/publishing-router';
import { PublishRequest } from '@/lib/connectors/types';
import { db } from '@/lib/db';
import { reviewAgent } from '@/lib/ai/review-agent';

export interface GovernedPublishResult {
  success: boolean;
  status: 'PUBLISHED' | 'SCHEDULED' | 'FAILED' | 'BLOCKED' | 'RECONCILIATION_REQUIRED';
  externalPostId?: string;
  permalink?: string;
  idempotencyKey: string;
  validationIssues?: string[];
  qualityRefreshed?: boolean;
  error?: string;
  publishedAt?: Date;
}

export class GovernedPublisherService {
  /**
   * Run deterministic platform-specific validation on content item
   */
  public async validateContentForPlatform(
    contentItem: any,
    channel: string
  ): Promise<{ status: 'READY' | 'NEEDS_REVISION' | 'BLOCKED'; issues: string[] }> {
    const issues: string[] = [];
    const primaryVariant = contentItem.variants?.[0] || {};
    const fullText = `${primaryVariant.hook || ''} ${primaryVariant.bodyText || ''} ${primaryVariant.ctaText || ''}`.trim();

    // 1. Text character limits
    const limits: Record<string, number> = {
      linkedin: 3000,
      facebook: 5000,
      instagram: 2200,
      telegram: 4096,
      x: 280,
      threads: 500,
      youtube: 5000,
      pinterest: 500,
      quora: 10000,
      wordpress: 50000,
      website: 50000,
    };

    const maxLimit = limits[channel] || 3000;
    if (fullText.length > maxLimit) {
      issues.push(`Text length (${fullText.length} chars) exceeds ${channel} limit of ${maxLimit} characters.`);
    }

    // 2. Capability check from registry
    const capability = connectorCapabilityRegistry.getCapability(channel as any);
    if (capability && capability.status === 'API_APPROVAL_REQUIRED') {
      issues.push(`Direct publishing on ${capability.name} requires official API approval. Use Export / Manual Publishing.`);
    }

    // 3. Approval status check
    if (contentItem.status !== 'APPROVED' && contentItem.status !== 'SCHEDULED') {
      issues.push(`Content Item status is currently "${contentItem.status}". Mandatory enterprise approval required before publication.`);
    }

    const status = issues.length > 0 ? (issues.some((i) => i.includes('approval') || i.includes('approval')) ? 'BLOCKED' : 'NEEDS_REVISION') : 'READY';
    return { status, issues };
  }

  /**
   * Pre-publish quality refresh check: Refreshes Quality Council review if stale
   */
  public async checkPrePublishQualityFreshness(
    contentItemId: string,
    brandId: string
  ): Promise<{ passesQualityGate: boolean; qualityRefreshed: boolean; reason?: string }> {
    let reviewResult = await db.reviewResult.findUnique({
      where: { contentItemId },
    });

    let qualityRefreshed = false;

    // Rerun review if missing or marked STALE
    if (!reviewResult || reviewResult.freshnessStatus === 'STALE') {
      const reviewRes = await reviewAgent.execute({
        taskId: `pre_publish_refresh_${Date.now()}`,
        tenantId: 'tenant-default',
        brandId,
        input: { contentItemId, brandId },
      });

      qualityRefreshed = true;
      reviewResult = await db.reviewResult.findUnique({
        where: { contentItemId },
      });
    }

    if (!reviewResult) {
      return { passesQualityGate: false, qualityRefreshed, reason: 'Failed to obtain verified review result.' };
    }

    if (reviewResult.overallStatus === 'blocked') {
      return { passesQualityGate: false, qualityRefreshed, reason: 'Quality Council Compliance or Fact Verification BLOCKED this content.' };
    }

    if (reviewResult.brandScore < 70) {
      return { passesQualityGate: false, qualityRefreshed, reason: `Brand alignment score (${reviewResult.brandScore}) is below minimum threshold (70).` };
    }

    if (reviewResult.factualRiskScore > 30) {
      return { passesQualityGate: false, qualityRefreshed, reason: `Factual risk score (${reviewResult.factualRiskScore}) exceeds maximum allowed risk threshold (30).` };
    }

    return { passesQualityGate: true, qualityRefreshed };
  }

  /**
   * Governed Live Publish Now with Idempotency & Quality Gates
   */
  public async publishNow(params: {
    brandId: string;
    contentItemId: string;
    channel: string;
    idempotencyKey: string;
    userId?: string;
  }): Promise<GovernedPublishResult> {
    const { brandId, contentItemId, channel, idempotencyKey, userId } = params;

    // 1. Idempotency Check: Prevent duplicate posts from double-clicks
    const existingLedger = await db.publicationLedgerEntry.findUnique({
      where: { idempotencyKey },
    });

    if (existingLedger && existingLedger.currentState === 'PUBLISHED') {
      return {
        success: true,
        status: 'PUBLISHED',
        externalPostId: existingLedger.platformPostId || undefined,
        permalink: existingLedger.permalink || undefined,
        idempotencyKey,
      };
    }

    // 2. Fetch Content Item & Campaign Governance details
    const contentItem = await db.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        campaign: true,
        variants: true,
      },
    });

    if (!contentItem) {
      return { success: false, status: 'BLOCKED', idempotencyKey, error: 'Content Item not found.' };
    }

    // 3. Platform Deterministic Validation
    const validation = await this.validateContentForPlatform(contentItem, channel);
    if (validation.status === 'BLOCKED') {
      await db.auditEvent.create({
        data: {
          tenantId: 'tenant-default',
          userId,
          brandId,
          campaignId: contentItem.campaignId,
          action: 'PUBLICATION_VALIDATION_FAILED',
          details: `Pre-publish validation blocked for ${channel}: ${validation.issues.join('; ')}`,
          entityType: 'ContentItem',
          entityId: contentItemId,
        },
      });

      return {
        success: false,
        status: 'BLOCKED',
        idempotencyKey,
        validationIssues: validation.issues,
        error: `Validation failed: ${validation.issues.join('; ')}`,
      };
    }

    // 4. Pre-Publish Quality Refresh & Gate Check
    const qualityGate = await this.checkPrePublishQualityFreshness(contentItemId, brandId);
    if (!qualityGate.passesQualityGate) {
      return {
        success: false,
        status: 'BLOCKED',
        idempotencyKey,
        qualityRefreshed: qualityGate.qualityRefreshed,
        error: `Quality gate check failed: ${qualityGate.reason}`,
      };
    }

    // 5. Create or Update Publication Ledger Entry (PENDING -> IN_FLIGHT)
    const primaryVariant = contentItem.variants[0] || {};
    const ledgerEntry = await db.publicationLedgerEntry.upsert({
      where: { idempotencyKey },
      update: { currentState: 'IN_FLIGHT', attemptCount: { increment: 1 } },
      create: {
        tenantId: 'tenant-default',
        publicationId: `pub_${Date.now()}`,
        campaignId: contentItem.campaignId,
        contentItemId: contentItem.id,
        contentVariantId: primaryVariant.id || `var_${contentItemId}`,
        platform: channel,
        idempotencyKey,
        requestChecksum: Buffer.from(`${contentItemId}:${channel}:${primaryVariant.bodyText || ''}`).toString('hex').slice(0, 32),
        intendedSchedule: new Date(),
        currentState: 'IN_FLIGHT',
      },
    });

    // 6. Invoke Publishing Router
    const publishReq: PublishRequest = {
      publicationId: ledgerEntry.publicationId,
      brandId,
      channel: channel as any,
      headline: primaryVariant.headline || contentItem.title,
      hook: primaryVariant.hook || '',
      bodyText: primaryVariant.bodyText || '',
      ctaText: primaryVariant.ctaText || contentItem.defaultCTA,
      imageUrl: primaryVariant.visualConcept || undefined,
      idempotencyKey,
    };

    const pubResult = await publishingRouter.publish(publishReq);

    if (!pubResult.success) {
      await db.publicationLedgerEntry.update({
        where: { id: ledgerEntry.id },
        data: {
          currentState: 'FAILED_PERMANENT',
          lastErrorDetails: pubResult.error || 'Publisher failed',
        },
      });

      await db.auditEvent.create({
        data: {
          tenantId: 'tenant-default',
          userId,
          brandId,
          campaignId: contentItem.campaignId,
          action: 'PUBLICATION_FAILED',
          details: `Live publishing to ${channel} failed: ${pubResult.error}`,
          entityType: 'ContentItem',
          entityId: contentItemId,
        },
      });

      return {
        success: false,
        status: 'FAILED',
        idempotencyKey,
        qualityRefreshed: qualityGate.qualityRefreshed,
        error: pubResult.error || 'Live publication failed',
      };
    }

    // 7. Record Success in Ledger & DB
    await db.publicationLedgerEntry.update({
      where: { id: ledgerEntry.id },
      data: {
        currentState: 'PUBLISHED',
        platformPostId: pubResult.externalPostId || `ext_${Date.now()}`,
        permalink: pubResult.permalink || null,
        publishedAt: pubResult.publishedAt,
      },
    });

    const publicationRecord = await db.publication.create({
      data: {
        contentItemId: contentItem.id,
        channel,
        publishingMode: pubResult.isSimulated ? 'simulated' : 'live',
        externalPostId: pubResult.externalPostId || `ext_${Date.now()}`,
        permalink: pubResult.permalink || null,
        status: 'SUCCESS',
        idempotencyKey,
        publishedAt: pubResult.publishedAt,
      },
    });

    // 8. Log Audit Event
    await db.auditEvent.create({
      data: {
        tenantId: 'tenant-default',
        userId,
        brandId,
        campaignId: contentItem.campaignId,
        action: pubResult.isSimulated ? 'PUBLISHED_SIMULATED' : 'PUBLISHED_LIVE',
        details: `Successfully published content "${contentItem.title}" to ${channel} (Post ID: ${pubResult.externalPostId || publicationRecord.id}).`,
        entityType: 'Publication',
        entityId: publicationRecord.id,
      },
    });

    // 9. Trigger initial normalized metric event
    await db.normalizedMetricEvent.create({
      data: {
        eventId: `ev_pub_${publicationRecord.id}`,
        tenantId: 'tenant-default',
        brandId,
        campaignId: contentItem.campaignId,
        contentId: contentItemId,
        publicationId: publicationRecord.id,
        platform: channel,
        eventType: 'snapshot',
        occurredAt: new Date(),
        metricsJson: JSON.stringify({
          impressions: 1,
          reach: 1,
          engagements: 0,
          clicks: 0,
          shares: 0,
          saves: 0,
        }),
        source: pubResult.isSimulated ? 'SIMULATED_ENGINE' : 'PLATFORM_API',
        dedupHash: `hash_${publicationRecord.id}_${Date.now()}`,
      },
    });

    return {
      success: true,
      status: 'PUBLISHED',
      externalPostId: pubResult.externalPostId || publicationRecord.id,
      permalink: pubResult.permalink || undefined,
      idempotencyKey,
      qualityRefreshed: qualityGate.qualityRefreshed,
      publishedAt: pubResult.publishedAt,
    };
  }
}

export const governedPublisherService = new GovernedPublisherService();
