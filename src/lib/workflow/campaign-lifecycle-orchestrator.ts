import { db } from '@/lib/db';
import { strategyAgent } from '@/lib/ai/strategy-agent';
import { copywritingAgent } from '@/lib/ai/copywriting-agent';
import { reviewAgent } from '@/lib/ai/review-agent';
import { schedulingAgent } from '@/lib/ai/scheduling-agent';
import { auditService } from '@/lib/services/audit-service';
import { autonomyEngine } from '@/lib/governance/autonomy-engine';
import { approvalService } from '@/lib/approval/approval-service';

export type CampaignLifecycleState =
  | 'draft'
  | 'researching'
  | 'strategy_ready'
  | 'strategy_approval_pending'
  | 'strategy_approved'
  | 'planning'
  | 'generating'
  | 'content_review'
  | 'content_approval'
  | 'ready_to_schedule'
  | 'scheduled'
  | 'publishing'
  | 'active'
  | 'completed'
  | 'paused'
  | 'failed';

export class CampaignLifecycleOrchestrator {
  /**
   * Transition campaign state and record structured audit event
   */
  public async transitionState(
    campaignId: string,
    newState: CampaignLifecycleState,
    actorId?: string,
    metadata?: any
  ): Promise<any> {
    const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new Error(`Campaign '${campaignId}' not found.`);

    const previousState = campaign.status;

    // Update campaign status
    const updated = await db.campaign.update({
      where: { id: campaignId },
      data: { status: newState.toUpperCase() },
    });

    // Record Domain Event
    await db.domainEventRecord.create({
      data: {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventType: `campaign.state_changed`,
        tenantId: 'tenant-default',
        correlationId: `corr_${campaignId}`,
        producer: 'CampaignLifecycleOrchestrator',
        payloadJson: JSON.stringify({
          campaignId,
          previousState,
          newState: newState.toUpperCase(),
          occurredAt: new Date().toISOString(),
          triggeredBy: actorId || 'SYSTEM',
          metadata: metadata || {},
        }),
      },
    });

    // Record Audit Event
    await auditService.recordEvent({
      tenantId: 'tenant-default',
      brandId: campaign.brandId,
      campaignId: campaign.id,
      category: 'Campaign',
      action: `campaign.transition_${newState}`,
      details: `Campaign '${campaign.name}' status transitioned from ${previousState} to ${newState.toUpperCase()}`,
      entityType: 'Campaign',
      entityId: campaign.id,
      metadata: {
        previousState,
        newState: newState.toUpperCase(),
        actorId: actorId || 'SYSTEM',
      },
    });

    return updated;
  }

  /**
   * Approve strategy and trigger Content Planning -> Post Generation -> Quality Review -> Autonomy Policy Evaluation -> Scheduling / Approval Queue
   */
  public async approveStrategy(
    campaignId: string,
    reviewerId?: string
  ): Promise<{
    success: boolean;
    campaign: any;
    contentCount: number;
    autoScheduledCount: number;
    pendingApprovalCount: number;
    oversightMode: string;
  }> {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true, strategy: true },
    });

    if (!campaign || !campaign.strategy) {
      throw new Error('Cannot approve strategy: Strategy record does not exist.');
    }

    const oversightMode = (campaign.oversightMode || 'APPROVAL_REQUIRED').toUpperCase().replace(/[\s-]+/g, '_');

    // 1. Mark Strategy APPROVED and Campaign STRATEGY_APPROVED
    await db.campaignStrategy.update({
      where: { campaignId },
      data: { status: 'APPROVED' },
    });

    // Record audit: strategy.approved
    await auditService.recordEvent({
      tenantId: 'tenant-default',
      brandId: campaign.brandId,
      campaignId: campaign.id,
      category: 'Campaign',
      action: 'strategy.approved',
      details: `Strategy approved for campaign '${campaign.name}' (Oversight Mode: ${oversightMode}).`,
      entityType: 'CampaignStrategy',
      entityId: campaign.strategy.id,
      metadata: {
        version: campaign.strategy.version,
        oversightMode,
        reviewerId: reviewerId || 'SYSTEM',
      },
    });

    await this.transitionState(campaignId, 'strategy_approved', reviewerId);

    // 2. Transition to PLANNING & prepare topic mix
    await this.transitionState(campaignId, 'planning', reviewerId);

    const pillars = JSON.parse(campaign.strategy.contentPillarsJson || '[]');
    const ideas = JSON.parse(campaign.strategy.contentIdeasJson || '[]');
    const channels = campaign.channels.split(',').map((c) => c.trim().toLowerCase()) as ('linkedin' | 'facebook' | 'instagram' | 'telegram')[];

    const topicsToGenerate = ideas.length > 0 ? ideas.slice(0, 3) : [
      `Why single LLM prompts fail enterprise brand standards in ${campaign.productOrTopic}`,
      `How Multi-Agent Systems eliminate AI hallucinations in corporate social media`,
      `4x Content Output Velocity with Deterministic Review Gates`,
    ];

    // 3. Transition to GENERATING & create content items
    await this.transitionState(campaignId, 'generating', reviewerId);
    const createdItems = [];
    let autoScheduledCount = 0;
    let pendingApprovalCount = 0;

    for (let i = 0; i < topicsToGenerate.length; i++) {
      const topic = topicsToGenerate[i];
      const pillar = pillars[i % Math.max(1, pillars.length)]?.name || 'Enterprise Strategy';
      const format = i === 2 ? 'carousel' : i === 1 ? 'image_post' : 'text_post';

      const taskId = `task_copy_${campaign.id}_${i}_${Date.now()}`;

      const agentRes = await copywritingAgent.execute({
        taskId,
        tenantId: 'tenant-default',
        brandId: campaign.brandId,
        campaignId: campaign.id,
        input: {
          brandId: campaign.brandId,
          campaignId: campaign.id,
          topicTitle: topic,
          contentPillar: pillar,
          targetAudience: campaign.targetAudience,
          format,
          defaultCTA: campaign.offerCTA,
          channels,
        },
      });

      if (agentRes.output) {
        const out = agentRes.output;

        // Create ContentItem in DRAFT state
        const item = await db.contentItem.create({
          data: {
            campaignId: campaign.id,
            title: out.title,
            coreIdea: out.coreIdea,
            targetAudience: campaign.targetAudience,
            contentPillar: out.contentPillar,
            format: out.format,
            defaultCTA: campaign.offerCTA,
            status: 'DRAFT',
          },
        });

        // Create ContentVariants
        for (const variant of out.variants) {
          await db.contentVariant.create({
            data: {
              contentItemId: item.id,
              channel: variant.channel,
              headline: variant.headline,
              hook: variant.hook,
              bodyText: variant.bodyText,
              ctaText: variant.ctaText,
              hashtags: (variant.hashtags || []).join(', '),
              altText: variant.altText,
              visualConcept: variant.visualConcept,
              carouselSlidesJson: variant.carouselSlides ? JSON.stringify(variant.carouselSlides) : null,
              status: 'GENERATED',
            },
          });
        }

        // Execute Quality Council Evaluation
        const qcRes = await reviewAgent.execute({
          taskId: `task_qc_${item.id}_${Date.now()}`,
          tenantId: 'tenant-default',
          brandId: campaign.brandId,
          campaignId: campaign.id,
          input: {
            contentItemId: item.id,
            brandId: campaign.brandId,
          },
        });

        const fullText = `${out.title} ${out.variants.map((v: any) => `${v.headline || ''} ${v.bodyText || ''}`).join(' ')}`;
        const reviewRecord = await db.reviewResult.findUnique({
          where: { contentItemId: item.id },
        });

        const riskScore = reviewRecord ? reviewRecord.factualRiskScore : (qcRes.output?.factualRiskScore ?? 10);
        const factualConfidence = reviewRecord ? reviewRecord.confidence : (qcRes.confidence ?? 0.95);
        const brandDnaScore = reviewRecord ? reviewRecord.brandScore : (qcRes.output?.brandScore ?? 90);

        // Create Approval Request
        await approvalService.createApprovalRequest({
          tenantId: 'tenant-default',
          brandId: campaign.brandId,
          campaignId: campaign.id,
          contentItemId: item.id,
          text: fullText,
          riskScore,
          factualConfidence,
          brandDnaScore,
          oversightMode: oversightMode as any,
          creatorUserId: reviewerId,
        });

        // Evaluate Publishing Autonomy
        const autonomyEval = await autonomyEngine.evaluatePublishingAutonomy({
          tenantId: 'tenant-default',
          brandId: campaign.brandId,
          campaignId: campaign.id,
          contentItemId: item.id,
          oversightMode: oversightMode as any,
          riskScore,
          factualConfidence,
          brandScore: brandDnaScore,
          duplicateSimilarity: 0.05,
          contentType: format,
          connectorStatus: 'CONNECTED',
          availableBudget: true,
        });

        const canAutoPublish = autonomyEval.canAutoPublish;

        if (canAutoPublish) {
          // Auto-approve content item
          await db.contentItem.update({
            where: { id: item.id },
            data: { status: 'APPROVED' },
          });

          // Automatically schedule
          const mainChannel = (channels[0] || 'linkedin') as 'linkedin' | 'facebook' | 'instagram' | 'telegram';
          const schedRes = await schedulingAgent.execute({
            taskId: `task_sched_${item.id}_${Date.now()}`,
            tenantId: 'tenant-default',
            brandId: campaign.brandId,
            campaignId: campaign.id,
            input: {
              brandId: campaign.brandId,
              campaignId: campaign.id,
              channel: mainChannel,
              startDate: campaign.startDate.toISOString(),
              endDate: campaign.endDate.toISOString(),
            },
          });

          if (schedRes.output && schedRes.output.recommendedSlots) {
            for (const slot of schedRes.output.recommendedSlots) {
              await db.schedule.create({
                data: {
                  campaignId: campaign.id,
                  contentItemId: item.id,
                  channel: slot.channel || mainChannel,
                  scheduledTime: new Date(slot.proposedTime),
                  timezone: 'UTC',
                  status: 'SCHEDULED',
                },
              });
            }
          }

          autoScheduledCount++;

          await auditService.recordEvent({
            tenantId: 'tenant-default',
            brandId: campaign.brandId,
            campaignId: campaign.id,
            category: 'Content',
            action: 'content.auto_approved',
            details: `Content '${item.title}' auto-approved under mode '${oversightMode}'.`,
            entityType: 'ContentItem',
            entityId: item.id,
            metadata: {
              oversightMode,
              riskScore,
              brandDnaScore,
            },
          });
        } else {
          // Keep in review queue for human review
          await db.contentItem.update({
            where: { id: item.id },
            data: { status: 'IN_REVIEW' },
          });

          pendingApprovalCount++;

          await auditService.recordEvent({
            tenantId: 'tenant-default',
            brandId: campaign.brandId,
            campaignId: campaign.id,
            category: 'Content',
            action: 'content.approval_queued',
            details: `Content '${item.title}' queued for mandatory human approval. Reasons: ${autonomyEval.reasons.join('; ')}`,
            entityType: 'ContentItem',
            entityId: item.id,
            metadata: {
              oversightMode,
              reasons: autonomyEval.reasons,
              requiresHumanApproval: true,
            },
          });
        }

        createdItems.push(item);
      }
    }

    // 4. Final Campaign State Transition
    let finalState: CampaignLifecycleState = 'content_approval';
    if (autoScheduledCount === createdItems.length && createdItems.length > 0) {
      finalState = 'scheduled';
    }

    const finalCampaign = await this.transitionState(campaignId, finalState, reviewerId, {
      oversightMode,
      autoScheduledCount,
      pendingApprovalCount,
      totalContentItems: createdItems.length,
    });

    return {
      success: true,
      campaign: finalCampaign,
      contentCount: createdItems.length,
      autoScheduledCount,
      pendingApprovalCount,
      oversightMode,
    };
  }
}

export const campaignLifecycleOrchestrator = new CampaignLifecycleOrchestrator();
