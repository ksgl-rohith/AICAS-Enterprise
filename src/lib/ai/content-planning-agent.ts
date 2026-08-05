import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';
import { TrendOpportunitySchema } from './trend-intelligence-agent';

export const ContentPlanItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string(),
  contentPillar: z.string(),
  audienceStage: z.enum(['awareness', 'consideration', 'decision', 'retention']),
  channel: z.enum(['linkedin', 'facebook', 'instagram', 'telegram']),
  contentType: z.enum(['text_post', 'image_post', 'carousel', 'video_script']),
  proposedDate: z.string(),
  dependencies: z.array(z.string()).default([]),
  sourceRequirements: z.array(z.string()).default([]),
  cta: z.string(),
  riskCategory: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  approvalRequired: z.boolean().default(true),
  assetRequirements: z.array(z.string()).default([]),
  category: z.enum(['evergreen', 'campaign', 'educational', 'conversion', 'reactive']),
});

export type ContentPlanItem = z.infer<typeof ContentPlanItemSchema>;

export const ContentPlanningInputSchema = z.object({
  campaignId: z.string(),
  campaignName: z.string(),
  objective: z.string(),
  channels: z.array(z.enum(['linkedin', 'facebook', 'instagram', 'telegram'])),
  startDate: z.string(),
  endDate: z.string(),
  pillars: z.array(z.string()),
  trends: z.array(TrendOpportunitySchema).default([]),
  postCountTarget: z.number().default(5),
});

export type ContentPlanningInput = z.input<typeof ContentPlanningInputSchema>;

export const ContentPlanningOutputSchema = z.object({
  campaignId: z.string(),
  planItems: z.array(ContentPlanItemSchema),
  collisionsDetected: z.number(),
  categoryDistribution: z.record(z.string(), z.number()),
  calendarReady: z.boolean(),
});

export type ContentPlanningOutput = z.infer<typeof ContentPlanningOutputSchema>;

export class ContentPlanningAgent {
  public async execute(
    task: AgentTask<ContentPlanningInput>
  ): Promise<AgentResult<ContentPlanningOutput>> {
    const startTime = Date.now();
    const { campaignId, campaignName, objective, channels, startDate, endDate, pillars, trends, postCountTarget } = task.input;

    const startTs = new Date(startDate).getTime();
    const endTs = new Date(endDate).getTime();
    const durationDays = Math.max(1, Math.ceil((endTs - startTs) / (1000 * 60 * 60 * 24)));

    const items: ContentPlanItem[] = [];
    const categories: ('evergreen' | 'campaign' | 'educational' | 'conversion' | 'reactive')[] = [
      'campaign',
      'educational',
      'conversion',
      'evergreen',
      'reactive',
    ];
    const audienceStages: ('awareness' | 'consideration' | 'decision' | 'retention')[] = [
      'awareness',
      'consideration',
      'decision',
      'awareness',
    ];
    const contentTypes: ('text_post' | 'image_post' | 'carousel' | 'video_script')[] = [
      'text_post',
      'carousel',
      'image_post',
      'text_post',
    ];

    let currentDayOffset = 0;
    const channelScheduleIndex: Record<string, number> = {};
    channels.forEach((c) => (channelScheduleIndex[c] = 0));

    const trendsList = trends || [];
    const targetCount = postCountTarget || 5;

    for (let i = 0; i < targetCount; i++) {
      const channel = channels[i % channels.length];
      const pillar = pillars[i % pillars.length] || 'Product Innovation';
      const category = categories[i % categories.length];
      const stage = audienceStages[i % audienceStages.length];
      const cType = contentTypes[i % contentTypes.length];

      // Distribute dates evenly across duration
      const dayOffset = Math.floor((i * durationDays) / Math.max(1, targetCount));
      const postDate = new Date(startTs + dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Check for trend inclusion
      const relevantTrend = trendsList[i % Math.max(1, trendsList.length)];
      const title = relevantTrend && category === 'reactive'
        ? `Reactive Insight: ${relevantTrend.title}`
        : `${campaignName}: ${pillar} Focus (${category})`;

      const riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' = category === 'reactive' ? 'MEDIUM' : 'LOW';

      items.push({
        id: `plan_item_${i + 1}`,
        title,
        objective: `${objective} via ${stage} stage content`,
        contentPillar: pillar,
        audienceStage: stage,
        channel,
        contentType: cType,
        proposedDate: postDate,
        dependencies: i > 0 ? [`plan_item_${i}`] : [],
        sourceRequirements: relevantTrend ? [relevantTrend.title] : ['Brand Knowledge Base'],
        cta: stage === 'decision' ? 'Book a Demo' : 'Learn More in Whitepaper',
        riskCategory,
        approvalRequired: riskCategory !== 'LOW',
        assetRequirements: cType === 'carousel' ? ['5-slide infographic deck'] : ['Header Graphic'],
        category,
      });
    }

    // Detect collisions (same channel on same proposed date)
    const collisionKeys = new Set<string>();
    let collisionsDetected = 0;

    for (const item of items) {
      const key = `${item.channel}_${item.proposedDate}`;
      if (collisionKeys.has(key)) {
        collisionsDetected++;
      } else {
        collisionKeys.add(key);
      }
    }

    // Calculate category distribution
    const categoryDistribution: Record<string, number> = {};
    for (const item of items) {
      categoryDistribution[item.category] = (categoryDistribution[item.category] || 0) + 1;
    }

    const output: ContentPlanningOutput = {
      campaignId,
      planItems: items,
      collisionsDetected,
      categoryDistribution,
      calendarReady: collisionsDetected === 0 && items.length > 0,
    };

    return {
      taskId: task.taskId,
      agentName: 'ContentPlanningAgent',
      status: 'completed',
      output,
      confidence: 0.95,
      warnings: collisionsDetected > 0 ? [`${collisionsDetected} schedule collisions detected in planned posts.`] : [],
      evidence: [],
      evaluationScores: {
        totalPlanItems: items.length,
        collisionsDetected,
        calendarReadyScore: collisionsDetected === 0 ? 1.0 : 0.7,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'deterministic-planning-engine',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const contentPlanningAgent = new ContentPlanningAgent();

// Register agent in AgentRegistry
agentRegistry.register({
  name: 'ContentPlanningAgent',
  version: '1.0.0',
  description: 'Converts campaign strategy and trends into a collision-free calendar content plan',
  executionMode: 'deterministic',
  inputSchema: ContentPlanningInputSchema,
  outputSchema: ContentPlanningOutputSchema,
  allowedTools: ['calendar_scheduler', 'collision_detector'],
  enabled: true,
  handler: (task) => contentPlanningAgent.execute(task),
});
