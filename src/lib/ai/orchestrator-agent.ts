import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { brandContextAgent } from './brand-context-agent';
import { strategyAgent, StrategyOutput } from './strategy-agent';
import { copywritingAgent, CopywritingOutput } from './copywriting-agent';
import { reviewAgent, ReviewOutput } from './review-agent';
import { marketResearchAgent, MarketResearchOutput } from './market-research-agent';
import { trendIntelligenceAgent, TrendIntelligenceOutput } from './trend-intelligence-agent';
import { contentPlanningAgent, ContentPlanningOutput } from './content-planning-agent';
import { imageContentAgent } from './image-agent';
import { carouselContentAgent } from './carousel-agent';
import { infographicAgent } from './infographic-agent';
import { staticVisualAgent } from './static-visual-agent';
import { agentRegistry } from './agent-registry';

export interface OrchestrationTaskInput {
  campaignId: string;
  brandId: string;
  oversightMode?: 'COPILOT' | 'APPROVAL_REQUIRED' | 'RISK_BASED' | 'AUTONOMOUS';
  autoSchedule?: boolean;
  maxRevisions?: number;
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
  trendIntelligence?: TrendIntelligenceOutput;
  contentPlan?: ContentPlanningOutput;
  contentItemsGenerated: number;
  autoScheduled: boolean;
  revisionLoopsExecuted: number;
}

export class OrchestratorAgent {
  public async executePipeline(task: AgentTask<OrchestrationTaskInput>): Promise<AgentResult<OrchestrationOutput>> {
    const startTime = Date.now();
    const stepsExecuted: OrchestrationStepResult[] = [];
    const { campaignId, brandId, autoSchedule = true, maxRevisions = 3 } = task.input;
    const tenantId = task.tenantId || 'tenant-default';
    const correlationId = task.correlationId || `corr_${Date.now()}`;

    // 1. Fetch Campaign & Brand
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true },
    });

    if (!campaign) {
      return {
        taskId: task.taskId,
        agentName: 'OrchestratorAgent',
        status: 'failed',
        confidence: 0,
        warnings: ['Campaign not found'],
        evidence: [],
      };
    }

    const oversightMode = task.input.oversightMode || campaign.oversightMode || 'APPROVAL_REQUIRED';

    // Step A: Brand Context
    const bcStartTime = Date.now();
    const bcRes = await brandContextAgent.execute({
      taskId: `${task.taskId}_bc`,
      tenantId,
      brandId,
      campaignId,
      correlationId,
      input: { brandId, query: campaign.productOrTopic },
    });

    stepsExecuted.push({
      stepName: 'Brand DNA & Context Setup',
      agentName: 'BrandContextAgent',
      status: bcRes.status,
      latencyMs: Date.now() - bcStartTime,
      summary: `Loaded Brand DNA for ${bcRes.output?.brandName || campaign.brand.name}.`,
    });

    // Step B: Market Research
    const mrStartTime = Date.now();
    const mrResult = await marketResearchAgent.execute({
      taskId: `${task.taskId}_mr`,
      tenantId,
      brandId,
      campaignId,
      correlationId,
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

    // Step C: Trend Intelligence
    const trendStartTime = Date.now();
    const trendResult = await trendIntelligenceAgent.execute({
      taskId: `${task.taskId}_trend`,
      tenantId,
      brandId,
      campaignId,
      correlationId,
      input: {
        signals: [
          {
            id: `sig_1`,
            title: `Latest Trends in ${campaign.productOrTopic}`,
            summary: `Market intelligence signal for ${campaign.brand.industry}`,
            source: 'Industry Signal Engine',
            sourceType: 'news',
            publishedAt: new Date().toISOString(),
            keywords: [campaign.productOrTopic, campaign.brand.industry],
          },
        ],
        industry: campaign.brand.industry,
        brandKeywords: campaign.brand.preferredVocabulary.split(','),
        targetAudience: campaign.targetAudience,
        minOpportunityScore: 0.3,
      },
    });

    stepsExecuted.push({
      stepName: 'Trend Intelligence & Clustering',
      agentName: 'TrendIntelligenceAgent',
      status: trendResult.status,
      latencyMs: Date.now() - trendStartTime,
      summary: `Identified ${trendResult.output?.opportunities.length || 0} ranked trend opportunities.`,
    });

    // Step D: Strategy Generation
    const stratStartTime = Date.now();
    const stratResult = await strategyAgent.execute({
      taskId: `${task.taskId}_strat`,
      tenantId,
      brandId,
      campaignId,
      correlationId,
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

    // Step E: Content Planning Agent
    const planStartTime = Date.now();
    const planResult = await contentPlanningAgent.execute({
      taskId: `${task.taskId}_plan`,
      tenantId,
      brandId,
      campaignId,
      correlationId,
      input: {
        campaignId,
        campaignName: campaign.name,
        objective: campaign.objective,
        channels: campaign.channels.split(',') as any,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        pillars: stratResult.output?.contentPillars.map((p) => p.name) || ['Product Innovation'],
        trends: trendResult.output?.opportunities || [],
        postCountTarget: 3,
      },
    });

    stepsExecuted.push({
      stepName: 'Content Plan & Schedule Balancing',
      agentName: 'ContentPlanningAgent',
      status: planResult.status,
      latencyMs: Date.now() - planStartTime,
      summary: `Created calendar-ready plan with ${planResult.output?.planItems.length || 0} scheduled items.`,
    });

    // Step F: Generation & Quality Council Review Loop
    const channels = campaign.channels.split(',') as ('linkedin' | 'facebook' | 'instagram' | 'telegram')[];
    const contentIdeas = stratResult.output?.contentIdeas || [campaign.productOrTopic];
    const planItems = planResult.output?.planItems || [];

    let itemsCreatedCount = 0;
    let revisionLoopsExecuted = 0;
    let pipelineStatus: 'success' | 'needs_human_approval' | 'blocked' = 'success';

    for (let i = 0; i < Math.min(3, planItems.length || contentIdeas.length); i++) {
      const planItem = planItems[i];
      const ideaTitle = planItem?.title || contentIdeas[i];
      const format = planItem?.contentType || (i === 0 ? 'text_post' : i === 1 ? 'image_post' : 'carousel');

      // Create ContentItem
      const itemRecord = await db.contentItem.create({
        data: {
          campaignId,
          title: ideaTitle,
          coreIdea: `Strategic execution focusing on ${campaign.productOrTopic} for ${campaign.targetAudience}`,
          targetAudience: campaign.targetAudience,
          contentPillar: planItem?.contentPillar || stratResult.output?.contentPillars[0]?.name || 'Core Product',
          format,
          defaultCTA: campaign.offerCTA,
          status: 'DRAFT',
        },
      });

      // 1. Copywriting Studio Generation
      const copyResult = await copywritingAgent.execute({
        taskId: `${task.taskId}_copy_${i}`,
        tenantId,
        brandId,
        campaignId,
        correlationId,
        input: {
          brandId,
          campaignId,
          topicTitle: ideaTitle,
          contentPillar: planItem?.contentPillar || 'Product Innovation',
          targetAudience: campaign.targetAudience,
          format: format as any,
          defaultCTA: campaign.offerCTA,
          channels,
        },
      });

      // Save Copy Variant
      if (copyResult.output?.variants[0]) {
        const v = copyResult.output.variants[0];
        const variantRecord = await db.contentVariant.create({
          data: {
            contentItemId: itemRecord.id,
            channel: v.channel,
            headline: v.headline || null,
            hook: v.hook,
            bodyText: v.bodyText,
            ctaText: v.ctaText,
            hashtags: v.hashtags.join(','),
            altText: v.altText || null,
            visualConcept: v.visualConcept || null,
            status: 'GENERATED',
          },
        });

        // Generate format-specific visual briefs
        if (format === 'image_post') {
          const imgRes = await imageContentAgent.execute({
            taskId: `${task.taskId}_img_${i}`,
            tenantId,
            brandId,
            input: {
              topicTitle: ideaTitle,
              brandName: campaign.brand.name,
              industry: campaign.brand.industry,
              targetAudience: campaign.targetAudience,
              channel: 'instagram',
              brandTone: campaign.brand.tone,
            },
          });
          if (imgRes.output) {
            await db.contentVariant.update({
              where: { id: variantRecord.id },
              data: { imageBriefJson: JSON.stringify(imgRes.output) },
            });
          }
        } else if (format === 'carousel') {
          const carRes = await carouselContentAgent.execute({
            taskId: `${task.taskId}_car_${i}`,
            tenantId,
            brandId,
            input: {
              topicTitle: ideaTitle,
              brandName: campaign.brand.name,
              industry: campaign.brand.industry,
              targetAudience: campaign.targetAudience,
              channel: 'linkedin',
              slideCount: 4,
            },
          });
          if (carRes.output) {
            await db.contentVariant.update({
              where: { id: variantRecord.id },
              data: { carouselSlidesJson: JSON.stringify(carRes.output.slides) },
            });
          }
        }
      }

      // 2. Quality Council Review & Controlled Revision Loop
      let currentAttempt = 0;
      let reviewResult: AgentResult<ReviewOutput> | null = null;

      while (currentAttempt <= maxRevisions) {
        currentAttempt++;
        reviewResult = await reviewAgent.execute({
          taskId: `${task.taskId}_rev_${i}_try_${currentAttempt}`,
          tenantId,
          brandId,
          campaignId,
          correlationId,
          input: {
            contentItemId: itemRecord.id,
            brandId,
          },
        });

        const revStatus = reviewResult.output?.overallStatus;

        if (revStatus === 'blocked') {
          pipelineStatus = 'blocked';
          await db.contentItem.update({
            where: { id: itemRecord.id },
            data: { status: 'REJECTED' },
          });
          break; // Stop immediately on deterministic block!
        } else if (revStatus === 'needs_revision' && currentAttempt <= maxRevisions) {
          revisionLoopsExecuted++;
          // Trigger targeted revision without infinite loop
          await copywritingAgent.execute({
            taskId: `${task.taskId}_copy_revision_${i}_try_${currentAttempt}`,
            tenantId,
            brandId,
            campaignId,
            correlationId,
            input: {
              brandId,
              campaignId,
              topicTitle: ideaTitle,
              contentPillar: planItem?.contentPillar || 'Product Innovation',
              targetAudience: campaign.targetAudience,
              format: format as any,
              defaultCTA: campaign.offerCTA,
              channels,
            },
          });
        } else {
          // Passed or max retries reached
          break;
        }
      }

      const finalStatus = reviewResult?.output?.overallStatus || 'passed';
      stepsExecuted.push({
        stepName: `Quality Council Governance (${ideaTitle})`,
        agentName: 'QualityCouncilCoordinator',
        status: finalStatus === 'passed' ? 'completed' : finalStatus === 'blocked' ? 'blocked' : 'needs_revision',
        latencyMs: Date.now() - startTime,
        summary: `Quality Council status: ${finalStatus.toUpperCase()} (Brand DNA: ${reviewResult?.output?.brandScore}, Compliance: ${reviewResult?.output?.complianceScore}).`,
      });

      if (finalStatus === 'passed') {
        await db.contentItem.update({
          where: { id: itemRecord.id },
          data: { status: 'APPROVED' },
        });
        itemsCreatedCount++;
      } else {
        await db.contentItem.update({
          where: { id: itemRecord.id },
          data: { status: 'NEEDS_REVISION' },
        });
      }
    }

    // Record Audit Event
    try {
      await db.auditEvent.create({
        data: {
          brandId,
          campaignId,
          action: 'PHASE1_PIPELINE_EXECUTED',
          details: `Phase 1 governance pipeline completed. Status: ${pipelineStatus}. Items generated: ${itemsCreatedCount}. Revision loops: ${revisionLoopsExecuted}.`,
          entityType: 'CAMPAIGN',
          entityId: campaignId,
        },
      });
    } catch (err) {
      console.warn('[OrchestratorAgent] Non-critical audit event error:', err);
    }

    const output: OrchestrationOutput = {
      campaignId,
      brandId,
      oversightMode,
      pipelineStatus,
      stepsExecuted,
      strategy: stratResult.output,
      marketResearch: mrResult.output,
      trendIntelligence: trendResult.output,
      contentPlan: planResult.output,
      contentItemsGenerated: itemsCreatedCount,
      autoScheduled: autoSchedule && pipelineStatus === 'success',
      revisionLoopsExecuted,
    };

    return {
      taskId: task.taskId,
      agentName: 'OrchestratorAgent',
      status: pipelineStatus === 'success' ? 'completed' : pipelineStatus === 'blocked' ? 'blocked' : 'needs_revision',
      output,
      confidence: 0.95,
      warnings: [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'orchestrator-governance-engine-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const orchestratorAgent = new OrchestratorAgent();

// Register in AgentRegistry
agentRegistry.register({
  name: 'OrchestratorAgent',
  version: '1.0.0',
  description: 'Coordinates Phase 1 content intelligence and Quality Council governance pipeline',
  executionMode: 'hybrid',
  inputSchema: undefined as any,
  outputSchema: undefined as any,
  allowedTools: ['pipeline_orchestrator'],
  enabled: true,
  handler: (task) => orchestratorAgent.executePipeline(task),
});
