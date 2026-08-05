import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { brandContextAgent } from './brand-context-agent';
import { strategyAgent, StrategyOutput } from './strategy-agent';
import { copywritingAgent, CopywritingOutput } from './copywriting-agent';
import { reviewAgent, ReviewOutput } from './review-agent';
import { marketResearchAgent, MarketResearchOutput } from './market-research-agent';
import { imageContentAgent } from './image-agent';
import { carouselContentAgent } from './carousel-agent';
import { infographicAgent } from './infographic-agent';
import { staticVisualAgent } from './static-visual-agent';

export interface OrchestrationTaskInput {
  campaignId: string;
  brandId: string;
  oversightMode?: 'COPILOT' | 'APPROVAL_REQUIRED' | 'RISK_BASED' | 'AUTONOMOUS';
  autoSchedule?: boolean;
}

export interface OrchestrationStepResult {
  stepName: string;
  agentName: string;
  status: 'completed' | 'needs_revision' | 'blocked' | 'skipped' | 'failed';
  latencyMs: number;
  summary: string;
}

export interface OrchestrationOutput {
  campaignId: string;
  brandId: string;
  oversightMode: string;
  pipelineStatus: 'success' | 'needs_human_approval' | 'blocked';
  stepsExecuted: OrchestrationStepResult[];
  strategy?: StrategyOutput;
  marketResearch?: MarketResearchOutput;
  contentItemsGenerated: number;
  autoScheduled: boolean;
}

export class OrchestratorAgent {
  public async executePipeline(task: AgentTask<OrchestrationTaskInput>): Promise<AgentResult<OrchestrationOutput>> {
    const startTime = Date.now();
    const stepsExecuted: OrchestrationStepResult[] = [];
    const { campaignId, brandId, autoSchedule = true } = task.input;

    // 1. Fetch Campaign & Brand
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true },
    });

    if (!campaign) {
      return {
        taskId: task.taskId,
        status: 'failed',
        confidence: 0,
        warnings: ['Campaign not found'],
        evidence: [],
      };
    }

    const oversightMode = task.input.oversightMode || campaign.oversightMode || 'APPROVAL_REQUIRED';

    // 2. Execute Market Research Agent
    const mrStartTime = Date.now();
    const mrResult = await marketResearchAgent.execute({
      taskId: `${task.taskId}_mr`,
      brandId,
      campaignId,
      input: {
        industry: campaign.brand.industry,
        topicOrProduct: campaign.productOrTopic,
        targetAudience: campaign.targetAudience,
        channels: campaign.channels.split(','),
      },
    });

    stepsExecuted.push({
      stepName: 'Market Research & Signals Analysis',
      agentName: 'MarketResearchAgent',
      status: mrResult.status,
      latencyMs: Date.now() - mrStartTime,
      summary: mrResult.output?.researchSummary || 'Market research completed',
    });

    // 3. Execute Strategy Agent
    const stratStartTime = Date.now();
    const stratResult = await strategyAgent.execute({
      taskId: `${task.taskId}_strat`,
      brandId,
      campaignId,
      input: {
        campaignId,
        brandId,
        name: campaign.name,
        objective: campaign.objective,
        productOrTopic: campaign.productOrTopic,
        targetAudience: campaign.targetAudience,
        offerCTA: campaign.offerCTA,
        channels: campaign.channels.split(',') as any,
        requiredMessages: campaign.requiredMessages || undefined,
        prohibitedThemes: campaign.prohibitedThemes || undefined,
      },
    });

    stepsExecuted.push({
      stepName: 'Grounded Strategy Generation',
      agentName: 'StrategyAgent',
      status: stratResult.status,
      latencyMs: Date.now() - stratStartTime,
      summary: `Generated ${stratResult.output?.contentPillars.length || 3} content pillars & multi-channel angles.`,
    });

    // Save Strategy to DB
    if (stratResult.output) {
      await db.campaignStrategy.upsert({
        where: { campaignId },
        update: {
          objectiveInterpretation: stratResult.output.objectiveInterpretation,
          audienceSummary: stratResult.output.audienceSummary,
          campaignNarrative: stratResult.output.campaignNarrative,
          contentPillarsJson: JSON.stringify(stratResult.output.contentPillars),
          channelRolesJson: JSON.stringify(stratResult.output.channelRoles),
          publishingCadence: stratResult.output.publishingCadence,
          contentIdeasJson: JSON.stringify(stratResult.output.contentIdeas),
          constraintsJson: JSON.stringify(stratResult.output.constraints),
        },
        create: {
          campaignId,
          objectiveInterpretation: stratResult.output.objectiveInterpretation,
          audienceSummary: stratResult.output.audienceSummary,
          campaignNarrative: stratResult.output.campaignNarrative,
          contentPillarsJson: JSON.stringify(stratResult.output.contentPillars),
          channelRolesJson: JSON.stringify(stratResult.output.channelRoles),
          publishingCadence: stratResult.output.publishingCadence,
          contentIdeasJson: JSON.stringify(stratResult.output.contentIdeas),
          constraintsJson: JSON.stringify(stratResult.output.constraints),
        },
      });
    }

    // 4. Generate Content Items & Multi-Format Visuals
    const channels = campaign.channels.split(',') as ('linkedin' | 'facebook' | 'instagram' | 'telegram')[];
    const contentIdeas = stratResult.output?.contentIdeas || [campaign.productOrTopic];

    let itemsCreatedCount = 0;
    const itemFormats = ['text_post', 'image_post', 'carousel', 'video_script'];

    for (let i = 0; i < Math.min(3, contentIdeas.length); i++) {
      const ideaTitle = contentIdeas[i];
      const format = itemFormats[i % itemFormats.length] as any;
      const pillar = stratResult.output?.contentPillars[i % (stratResult.output.contentPillars.length || 1)]?.name || 'Thought Leadership';

      // Create ContentItem
      const contentItem = await db.contentItem.create({
        data: {
          campaignId,
          title: ideaTitle,
          coreIdea: `${ideaTitle} for ${campaign.targetAudience}`,
          targetAudience: campaign.targetAudience,
          contentPillar: pillar,
          format,
          defaultCTA: campaign.offerCTA,
          status: 'DRAFT',
        },
      });

      // Execute Copywriting Agent
      const copyRes = await copywritingAgent.execute({
        taskId: `${task.taskId}_copy_${contentItem.id}`,
        brandId,
        campaignId,
        input: {
          brandId,
          campaignId,
          topicTitle: ideaTitle,
          contentPillar: pillar,
          targetAudience: campaign.targetAudience,
          format,
          defaultCTA: campaign.offerCTA,
          channels,
        },
      });

      // Execute Visual Agents for richer visual artifacts
      const imageRes = await imageContentAgent.execute({
        taskId: `${task.taskId}_img_${contentItem.id}`,
        brandId,
        input: {
          topicTitle: ideaTitle,
          brandName: campaign.brand.name,
          industry: campaign.brand.industry,
          targetAudience: campaign.targetAudience,
          channel: channels[0] || 'linkedin',
          brandTone: campaign.brand.tone,
        },
      });

      const carouselRes = await carouselContentAgent.execute({
        taskId: `${task.taskId}_car_${contentItem.id}`,
        brandId,
        input: {
          topicTitle: ideaTitle,
          brandName: campaign.brand.name,
          industry: campaign.brand.industry,
          targetAudience: campaign.targetAudience,
          channel: 'instagram',
        },
      });

      const infographicRes = await infographicAgent.execute({
        taskId: `${task.taskId}_info_${contentItem.id}`,
        brandId,
        input: {
          topicTitle: ideaTitle,
          brandName: campaign.brand.name,
          industry: campaign.brand.industry,
          targetAudience: campaign.targetAudience,
        },
      });

      const staticVisualRes = await staticVisualAgent.execute({
        taskId: `${task.taskId}_stat_${contentItem.id}`,
        brandId,
        input: {
          topicTitle: ideaTitle,
          brandName: campaign.brand.name,
          industry: campaign.brand.industry,
        },
      });

      // Create ContentVariants
      if (copyRes.output?.variants) {
        for (const v of copyRes.output.variants) {
          await db.contentVariant.create({
            data: {
              contentItemId: contentItem.id,
              channel: v.channel,
              headline: v.headline || null,
              hook: v.hook,
              bodyText: v.bodyText,
              ctaText: v.ctaText,
              hashtags: v.hashtags?.join(',') || null,
              altText: v.altText || null,
              visualConcept: v.visualConcept || null,
              carouselSlidesJson: JSON.stringify(v.carouselSlides || carouselRes.output?.slides),
              imageBriefJson: JSON.stringify(imageRes.output),
              infographicSpecsJson: JSON.stringify(infographicRes.output),
              staticVisualJson: JSON.stringify(staticVisualRes.output),
              status: 'GENERATED',
            },
          });
        }
      }

      // Execute Review Agent
      const revResult = await reviewAgent.execute({
        taskId: `${task.taskId}_rev_${contentItem.id}`,
        brandId,
        campaignId,
        input: {
          contentItemId: contentItem.id,
          brandId,
        },
      });

      // Enforce Oversight Mode Governance Rules
      let itemFinalStatus = 'DRAFT';
      if (oversightMode === 'AUTONOMOUS') {
        itemFinalStatus = revResult.output?.overallStatus === 'passed' ? 'APPROVED' : 'NEEDS_REVISION';
      } else if (oversightMode === 'RISK_BASED') {
        const isSafe = (revResult.output?.complianceScore || 0) >= 90 && (revResult.output?.factualRiskScore || 100) <= 20;
        itemFinalStatus = isSafe ? 'APPROVED' : 'NEEDS_REVISION';
      } else {
        // COPILOT or APPROVAL_REQUIRED: Holds in Approval queue
        itemFinalStatus = 'DRAFT';
      }

      await db.contentItem.update({
        where: { id: contentItem.id },
        data: { status: itemFinalStatus },
      });

      // Auto-Schedule if enabled or autonomous
      if (autoSchedule && (itemFinalStatus === 'APPROVED' || oversightMode === 'AUTONOMOUS' || oversightMode === 'APPROVAL_REQUIRED')) {
        const schedules = mrResult.output?.optimalChannelSchedules || [];
        for (let idx = 0; idx < channels.length; idx++) {
          const ch = channels[idx];
          const schedInfo = schedules.find((s) => s.channel.toLowerCase() === ch.toLowerCase());
          const postDate = new Date();
          postDate.setDate(postDate.getDate() + (i + 1) * 2 + idx);
          postDate.setHours(14, 0, 0, 0);

          await db.schedule.create({
            data: {
              campaignId,
              contentItemId: contentItem.id,
              channel: ch,
              scheduledTime: postDate,
              status: itemFinalStatus === 'APPROVED' ? 'SCHEDULED' : 'PENDING_APPROVAL',
            },
          });
        }
      }

      itemsCreatedCount++;
    }

    stepsExecuted.push({
      stepName: 'Multi-Format Generation & Quality Review',
      agentName: 'CopywritingAgent + ReviewAgent',
      status: 'completed',
      latencyMs: Date.now() - startTime,
      summary: `Generated ${itemsCreatedCount} content items across ${channels.length} channels with visual previews.`,
    });

    // Update Campaign Status
    await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: oversightMode === 'AUTONOMOUS' ? 'ACTIVE' : 'IN_REVIEW',
        oversightMode,
      },
    });

    // Audit Event Log
    await db.auditEvent.create({
      data: {
        brandId,
        campaignId,
        action: 'PIPELINE_ORCHESTRATED',
        details: `Orchestrated multi-agent campaign pipeline under ${oversightMode} oversight mode. Generated ${itemsCreatedCount} content items.`,
        entityType: 'Campaign',
        entityId: campaignId,
      },
    });

    // Log Agent Run
    await db.agentRun.create({
      data: {
        taskId: task.taskId,
        agentName: 'OrchestratorAgent',
        status: 'completed',
        inputSummary: `Campaign: ${campaign.name}, Oversight: ${oversightMode}`,
        outputSummary: `Orchestrated ${stepsExecuted.length} steps. Generated ${itemsCreatedCount} content items.`,
        confidence: 0.98,
        latencyMs: Date.now() - startTime,
      },
    });

    const pipelineStatus = oversightMode === 'AUTONOMOUS' ? 'success' : 'needs_human_approval';

    return {
      taskId: task.taskId,
      status: 'completed',
      output: {
        campaignId,
        brandId,
        oversightMode,
        pipelineStatus,
        stepsExecuted,
        strategy: stratResult.output,
        marketResearch: mrResult.output,
        contentItemsGenerated: itemsCreatedCount,
        autoScheduled: autoSchedule,
      },
      confidence: 0.98,
      warnings: [],
      evidence: stratResult.evidence,
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'orchestrator-v1',
        promptVersion: 'v1.0-orchestration',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const orchestratorAgent = new OrchestratorAgent();
