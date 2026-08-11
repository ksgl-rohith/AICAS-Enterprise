import { db } from '@/lib/db';
import { strategyAgent } from '@/lib/ai/strategy-agent';
import { copywritingAgent } from '@/lib/ai/copywriting-agent';
import { reviewAgent } from '@/lib/ai/review-agent';
import { schedulingAgent } from '@/lib/ai/scheduling-agent';
import { auditService } from '@/lib/services/audit-service';

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
   * Approve strategy and automatically trigger Content Planning -> Post Generation -> Quality Review -> Scheduling
   */
  public async approveStrategy(campaignId: string, reviewerId?: string): Promise<{ success: boolean; campaign: any; contentCount: number }> {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true, strategy: true },
    });

    if (!campaign || !campaign.strategy) {
      throw new Error('Cannot approve strategy: Strategy record does not exist.');
    }

    // 1. Mark Strategy APPROVED and Campaign STRATEGY_APPROVED
    await db.campaignStrategy.update({
      where: { campaignId },
      data: { status: 'APPROVED' },
    });

    await this.transitionState(campaignId, 'strategy_approved', reviewerId);

    // 2. Transition to PLANNING & run Content Planning Agent
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

        // Create ContentItem
        const item = await db.contentItem.create({
          data: {
            campaignId: campaign.id,
            title: out.title,
            coreIdea: out.coreIdea,
            targetAudience: campaign.targetAudience,
            contentPillar: out.contentPillar,
            format: out.format,
            defaultCTA: campaign.offerCTA,
            status: 'APPROVED',
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
        await reviewAgent.execute({
          taskId: `task_qc_${item.id}_${Date.now()}`,
          tenantId: 'tenant-default',
          brandId: campaign.brandId,
          campaignId: campaign.id,
          input: {
            contentItemId: item.id,
            brandId: campaign.brandId,
          },
        });

        // 4. Automatically Schedule Content Item
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

        // Persist Schedule records in DB
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

        createdItems.push(item);
      }
    }

    // 5. Transition Campaign to SCHEDULED
    const finalCampaign = await this.transitionState(campaignId, 'scheduled', reviewerId);

    return {
      success: true,
      campaign: finalCampaign,
      contentCount: createdItems.length,
    };
  }
}

export const campaignLifecycleOrchestrator = new CampaignLifecycleOrchestrator();
