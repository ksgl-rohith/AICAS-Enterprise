import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';

export interface MarketResearchInput {
  industry: string;
  topicOrProduct: string;
  targetAudience: string;
  channels: string[];
}

export const ChannelScheduleRecommendationSchema = z.object({
  channel: z.string(),
  peakPostingWindow: z.string(),
  optimalDays: z.array(z.string()),
  recommendedTimeUtc: z.string(),
  expectedEngagementMultiplier: z.number(),
  audienceActivityRationale: z.string(),
});

export const MarketResearchOutputSchema = z.object({
  industryTrends: z.array(z.string()),
  competitorStrategyAngles: z.array(z.string()),
  highPerformingContentFormats: z.array(z.string()),
  audiencePainPoints: z.array(z.string()),
  optimalChannelSchedules: z.array(ChannelScheduleRecommendationSchema),
  marketOpportunityScore: z.number(),
  researchSummary: z.string(),
});

export type MarketResearchOutput = z.infer<typeof MarketResearchOutputSchema>;

export class MarketResearchAgent {
  public async execute(task: AgentTask<MarketResearchInput>): Promise<AgentResult<MarketResearchOutput>> {
    const startTime = Date.now();
    const { industry, topicOrProduct, targetAudience, channels } = task.input;

    const systemPrompt = `You are an AI Market Intelligence & Social Strategy Analyst.
Your goal is to conduct market trend research, competitor analysis, and audience timing profiling for "${topicOrProduct}" in the "${industry}" sector targeting "${targetAudience}".`;

    const userPrompt = `Industry: ${industry}
Product/Topic: ${topicOrProduct}
Target Audience: ${targetAudience}
Requested Channels: ${channels.join(', ')}`;

    const mockFallback: MarketResearchOutput = {
      industryTrends: [
        'Enterprise migration toward multi-agent AI frameworks and automated brand governance',
        'Shift from raw automated text to rich visual carousels and infographic data stories',
        'Increased regulatory compliance scrutiny on AI-generated corporate marketing claims',
      ],
      competitorStrategyAngles: [
        'Competitors highlight speed but lack automated compliance and brand safety checks',
        'Gaps in competitor offerings around transparent whitepaper grounding and RAG evidence',
      ],
      highPerformingContentFormats: [
        'LinkedIn 4-slide carousel breakdowns showing system architecture & ROI',
        'Instagram aesthetic infographic slides highlighting 3-step compliance checklists',
        'Facebook event card graphics promoting executive live masterclasses',
        'Telegram instant signal alerts with bulleted key takeaways',
      ],
      audiencePainPoints: [
        'Fear of AI hallucinated posts harming enterprise brand reputation',
        'High labor bottleneck in reviewing and approving multi-channel content',
        'Difficulty scaling consistent quality across LinkedIn, Instagram, Facebook & Telegram',
      ],
      optimalChannelSchedules: [
        {
          channel: 'linkedin',
          peakPostingWindow: '08:30 AM - 10:00 AM EST',
          optimalDays: ['Tuesday', 'Wednesday', 'Thursday'],
          recommendedTimeUtc: '13:30',
          expectedEngagementMultiplier: 3.4,
          audienceActivityRationale: 'B2B decision makers active during mid-week morning coffee hours and strategy planning windows.',
        },
        {
          channel: 'instagram',
          peakPostingWindow: '12:00 PM - 01:30 PM & 06:00 PM EST',
          optimalDays: ['Wednesday', 'Friday', 'Sunday'],
          recommendedTimeUtc: '17:00',
          expectedEngagementMultiplier: 2.8,
          audienceActivityRationale: 'High visual engagement during afternoon lunch breaks and evening leisure browsing.',
        },
        {
          channel: 'facebook',
          peakPostingWindow: '01:00 PM - 03:00 PM EST',
          optimalDays: ['Monday', 'Wednesday', 'Thursday'],
          recommendedTimeUtc: '18:00',
          expectedEngagementMultiplier: 2.1,
          audienceActivityRationale: 'Community and event card link clicks peak mid-afternoon.',
        },
        {
          channel: 'telegram',
          peakPostingWindow: '09:00 AM & 05:00 PM EST',
          optimalDays: ['Tuesday', 'Thursday'],
          recommendedTimeUtc: '14:00',
          expectedEngagementMultiplier: 2.5,
          audienceActivityRationale: 'Immediate push notification open rates peak during start and end of workday.',
        },
      ],
      marketOpportunityScore: 94,
      researchSummary: `Market research signals high demand for grounded multi-agent content governance in ${industry}. Positioning ${topicOrProduct} with transparent RAG proof and automated safety checks yields optimal audience conversion.`,
    };

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: MarketResearchOutputSchema,
      mockFallback,
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: 0.96,
      warnings: [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-market-research',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const marketResearchAgent = new MarketResearchAgent();
