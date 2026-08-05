import { db } from '@/lib/db';
import { eventBus } from '@/lib/events/event-bus';
import { createDomainEvent } from '@/lib/events/domain-events';

export type OversightMode = 'COPILOT' | 'APPROVAL_REQUIRED' | 'RISK_BASED' | 'AUTONOMOUS';

export interface ApprovalPolicyEvaluation {
  oversightMode: OversightMode;
  mandatoryApproval: boolean;
  mandatoryReason?: string;
  riskCategory: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
}

export function evaluateApprovalPolicy(params: {
  oversightMode?: OversightMode;
  riskScore: number;
  factualConfidence: number;
  brandDnaScore: number;
  text: string;
  hasUnsupportedClaims?: boolean;
}): ApprovalPolicyEvaluation {
  const mode = params.oversightMode || 'APPROVAL_REQUIRED';
  const textLower = params.text.toLowerCase();

  let mandatoryApproval = false;
  let mandatoryReason: string | undefined = undefined;

  // 1. Mandatory Human Approval Categories Check
  if (/medical|fda\s+approved|cures|diagnoses|health\s+benefits/i.test(textLower)) {
    mandatoryApproval = true;
    mandatoryReason = 'Medical claim detected requiring mandatory compliance oversight.';
  } else if (/legal|lawsuit|indemnify|liability|patent/i.test(textLower)) {
    mandatoryApproval = true;
    mandatoryReason = 'Legal statement detected requiring mandatory legal counsel review.';
  } else if (/guarantee[s]?\s+return[s]?|financial\s+return|investment\s+growth|interest\s+rate/i.test(textLower)) {
    mandatoryApproval = true;
    mandatoryReason = 'Financial promise detected requiring mandatory risk review.';
  } else if (/election|political|candidate|legislation/i.test(textLower)) {
    mandatoryApproval = true;
    mandatoryReason = 'Political content detected requiring mandatory corporate policy review.';
  } else if (/statement\s+from\s+ceo|executive\s+announcement|press\s+release/i.test(textLower)) {
    mandatoryApproval = true;
    mandatoryReason = 'Executive statement requiring mandatory PR sign-off.';
  } else if (params.hasUnsupportedClaims || params.factualConfidence < 0.75) {
    mandatoryApproval = true;
    mandatoryReason = 'Disputed or unsupported claim detected requiring human verification.';
  }

  // Determine Risk Category
  let riskCategory: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL';
  if (mandatoryApproval || params.riskScore > 60) {
    riskCategory = 'CRITICAL';
  } else if (params.riskScore > 30 || params.brandDnaScore < 80) {
    riskCategory = 'HIGH';
  } else if (params.riskScore < 15 && params.brandDnaScore >= 90) {
    riskCategory = 'LOW';
  }

  if (mode === 'APPROVAL_REQUIRED') {
    mandatoryApproval = true;
  } else if (mode === 'AUTONOMOUS' && !mandatoryApproval && riskCategory === 'LOW') {
    mandatoryApproval = false;
  }

  return {
    oversightMode: mode,
    mandatoryApproval,
    mandatoryReason,
    riskCategory,
  };
}

export class ApprovalService {
  public async createApprovalRequest(params: {
    tenantId: string;
    brandId: string;
    campaignId?: string;
    contentItemId: string;
    text: string;
    riskScore: number;
    factualConfidence: number;
    brandDnaScore: number;
    oversightMode?: OversightMode;
    hasUnsupportedClaims?: boolean;
    creatorUserId?: string;
  }) {
    const policy = evaluateApprovalPolicy({
      oversightMode: params.oversightMode,
      riskScore: params.riskScore,
      factualConfidence: params.factualConfidence,
      brandDnaScore: params.brandDnaScore,
      text: params.text,
      hasUnsupportedClaims: params.hasUnsupportedClaims,
    });

    const request = await db.approvalRequest.create({
      data: {
        tenantId: params.tenantId,
        brandId: params.brandId,
        campaignId: params.campaignId,
        contentItemId: params.contentItemId,
        oversightMode: policy.oversightMode,
        riskCategory: policy.riskCategory,
        mandatoryApproval: policy.mandatoryApproval,
        mandatoryReason: policy.mandatoryReason,
        status: policy.mandatoryApproval ? 'PENDING' : 'APPROVED',
        slaHours: policy.riskCategory === 'CRITICAL' ? 12 : 24,
        concurrencyVersion: 1,
      },
    });

    // Publish domain event
    await eventBus.publish(
      createDomainEvent(
        'content.approval.requested',
        params.tenantId,
        `corr_appr_${request.id}`,
        'ApprovalService',
        {
          approvalRequestId: request.id,
          contentItemId: params.contentItemId,
          mandatoryApproval: policy.mandatoryApproval,
          riskCategory: policy.riskCategory,
        }
      )
    );

    return request;
  }

  public async getApprovalQueue(tenantId: string, status = 'PENDING') {
    const requests = await db.approvalRequest.findMany({
      where: {
        tenantId,
        status,
      },
      orderBy: { requestedAt: 'asc' },
    });

    const now = Date.now();
    return requests.map((req) => {
      const ageHours = (now - new Date(req.requestedAt).getTime()) / (1000 * 60 * 60);
      const isSlaBreached = ageHours > req.slaHours;
      return {
        ...req,
        ageHours: Math.round(ageHours * 10) / 10,
        isSlaBreached,
      };
    });
  }

  public async approve(approvalId: string, reviewerId: string, comment?: string, expectedVersion = 1) {
    const existing = await db.approvalRequest.findUnique({ where: { id: approvalId } });
    if (!existing) throw new Error('Approval request not found');

    if (existing.concurrencyVersion !== expectedVersion) {
      throw new Error(`Optimistic concurrency conflict: Expected version ${expectedVersion}, found ${existing.concurrencyVersion}`);
    }

    const comments = existing.commentsJson ? JSON.parse(existing.commentsJson) : [];
    if (comment) {
      comments.push({ reviewerId, comment, timestamp: new Date().toISOString() });
    }

    const updated = await db.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: 'APPROVED',
        assignedReviewerId: reviewerId,
        commentsJson: JSON.stringify(comments),
        decidedAt: new Date(),
        concurrencyVersion: { increment: 1 },
      },
    });

    // Update ContentItem status if exists
    try {
      await db.contentItem.update({
        where: { id: existing.contentItemId },
        data: { status: 'APPROVED' },
      });
    } catch {
      // Ignore if contentItem is decoupled or synthetic in unit test
    }

    await eventBus.publish(
      createDomainEvent('content.approved', existing.tenantId, `corr_appr_${approvalId}`, 'ApprovalService', {
        approvalId,
        contentItemId: existing.contentItemId,
        reviewerId,
      })
    );

    return updated;
  }

  public async reject(approvalId: string, reviewerId: string, comment: string, expectedVersion = 1) {
    const existing = await db.approvalRequest.findUnique({ where: { id: approvalId } });
    if (!existing) throw new Error('Approval request not found');

    if (existing.concurrencyVersion !== expectedVersion) {
      throw new Error(`Optimistic concurrency conflict: Expected version ${expectedVersion}, found ${existing.concurrencyVersion}`);
    }

    const comments = existing.commentsJson ? JSON.parse(existing.commentsJson) : [];
    comments.push({ reviewerId, comment, timestamp: new Date().toISOString() });

    const updated = await db.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: 'REJECTED',
        assignedReviewerId: reviewerId,
        commentsJson: JSON.stringify(comments),
        decidedAt: new Date(),
        concurrencyVersion: { increment: 1 },
      },
    });

    await db.contentItem.update({
      where: { id: existing.contentItemId },
      data: { status: 'REJECTED' },
    });

    await eventBus.publish(
      createDomainEvent('content.rejected', existing.tenantId, `corr_appr_${approvalId}`, 'ApprovalService', {
        approvalId,
        contentItemId: existing.contentItemId,
        reviewerId,
        reason: comment,
      })
    );

    return updated;
  }

  public async requestRevision(approvalId: string, reviewerId: string, comment: string, expectedVersion = 1) {
    const existing = await db.approvalRequest.findUnique({ where: { id: approvalId } });
    if (!existing) throw new Error('Approval request not found');

    const comments = existing.commentsJson ? JSON.parse(existing.commentsJson) : [];
    comments.push({ reviewerId, comment, timestamp: new Date().toISOString() });

    const updated = await db.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: 'REVISION_REQUESTED',
        assignedReviewerId: reviewerId,
        commentsJson: JSON.stringify(comments),
        decidedAt: new Date(),
        concurrencyVersion: { increment: 1 },
      },
    });

    await db.contentItem.update({
      where: { id: existing.contentItemId },
      data: { status: 'NEEDS_REVISION' },
    });

    await eventBus.publish(
      createDomainEvent('content.revision.requested', existing.tenantId, `corr_appr_${approvalId}`, 'ApprovalService', {
        approvalId,
        contentItemId: existing.contentItemId,
        reviewerId,
        comment,
      })
    );

    return updated;
  }
}

export const approvalService = new ApprovalService();
