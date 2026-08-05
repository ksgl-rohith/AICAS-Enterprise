import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { brandContextAgent } from './brand-context-agent';
import { marketResearchAgent } from './market-research-agent';
import { modelGateway } from './model-gateway';

export const ContentPillarSchema = z.object({
  name: z.string(),
  angle: z.string(),
  rationale: z.string(),
});

export const StrategyOutputSchema = z.object({
  objectiveInterpretation: z.string(),
  audienceSummary: z.string(),
  campaignNarrative: z.string(),
  contentPillars: z.array(ContentPillarSchema),
  channelRoles: z.record(z.string(), z.string()),
  publishingCadence: z.string(),
  contentIdeas: z.array(z.string()),
  constraints: z.array(z.string()),
});

export type StrategyOutput = z.infer<typeof StrategyOutputSchema>;

export interface StrategyInput {
  campaignId: string;
  brandId: string;
  name: string;
  objective: string;
  productOrTopic: string;
  targetAudience: string;
  offerCTA: string;
  channels: string[];
  requiredMessages?: string;
  prohibitedThemes?: string;
}

export class StrategyAgent {
  public async execute(task: AgentTask<StrategyInput>): Promise<AgentResult<StrategyOutput>> {
    const startTime = Date.now();
    
    // Fetch brand context & grounded RAG chunks
    const brandCtx = await brandContextAgent.execute({
      taskId: `${task.taskId}_brand`,
      tenantId: task.tenantId || 'tenant-default',
      brandId: task.brandId,
      input: { brandId: task.brandId, query: task.input.productOrTopic },
    });

    const brandName = brandCtx.output?.brandName || 'Brand';
    const industry = brandCtx.output?.industry || 'General Industry';
    const description = brandCtx.output?.description || '';
    const personality = brandCtx.output?.personality || '';
    const brandTone = brandCtx.output?.tone || 'Professional';
    const preferredVocab = brandCtx.output?.preferredVocabulary?.join(', ') || 'None';
    const prohibitedPhrases = brandCtx.output?.prohibitedPhrases?.join(', ') || 'None';
    const defaultCTA = brandCtx.output?.defaultCTA || task.input.offerCTA;
    const groundedFacts = brandCtx.output?.groundedChunks.map((c) => `[${c.filename}]: ${c.content}`).join('\n') || '';

    // Fetch real-time market research signals
    const mrRes = await marketResearchAgent.execute({
      taskId: `${task.taskId}_mr`,
      tenantId: task.tenantId || 'tenant-default',
      brandId: task.brandId,
      campaignId: task.campaignId,
      input: {
        industry,
        topicOrProduct: task.input.productOrTopic,
        targetAudience: task.input.targetAudience,
        channels: task.input.channels,
      },
    });

    const trends = mrRes.output?.industryTrends.join('; ') || 'High enterprise demand for autonomous content governance.';
    const formats = mrRes.output?.highPerformingContentFormats.join('; ') || 'Visual carousels & infographic data stories.';

    const systemPrompt = `You are an elite Enterprise AI Campaign Strategist for "${brandName}".
Industry: ${industry}
Company Overview: ${description || 'Not specified'}
Brand Personality: ${personality || 'Not specified'}
Brand Tone: ${brandTone}
Preferred Vocabulary: ${preferredVocab}
Prohibited Phrases: ${prohibitedPhrases}
Default CTA: ${defaultCTA}

Market Intelligence Signals:
- Trends: ${trends}
- Top Formats: ${formats}

Grounded Knowledge Base & Evidence:
${groundedFacts || 'Whitepaper grounding evidence available.'}

YOUR TASK:
Create a tailored, high-impact multi-channel content strategy specifically designed for ${brandName} (${industry}). Ensure the pillars, angles, and content ideas reflect this company's actual business model, market intelligence, and unique brand identity.`;

    const userPrompt = `Campaign Name: ${task.input.name}
Objective: ${task.input.objective}
Product/Topic: ${task.input.productOrTopic}
Target Audience: ${task.input.targetAudience}
CTA: ${task.input.offerCTA || defaultCTA}
Target Channels: ${task.input.channels.join(', ')}
Required Messages: ${task.input.requiredMessages || 'None'}
Prohibited Themes: ${task.input.prohibitedThemes || 'None'}`;

    const mockFallback: StrategyOutput = {
      objectiveInterpretation: `Drive high-conversion ${task.input.objective.replace(/_/g, ' ')} for ${task.input.productOrTopic} targeting ${task.input.targetAudience} in the ${industry} domain.`,
      audienceSummary: `${task.input.targetAudience} seeking trusted, compliant solutions in ${industry}, aligning with ${brandName}'s value proposition (${personality || brandTone}).`,
      campaignNarrative: `Elevating ${brandName}'s presence in ${industry} by spotlighting ${task.input.productOrTopic} through authentic, ${brandTone.toLowerCase()} messaging, backed by multi-agent AI safety guardrails.`,
      contentPillars: [
        {
          name: `${task.input.productOrTopic} & Architectural Leadership`,
          angle: `How ${brandName} is redefining ${task.input.productOrTopic} for enterprise ${task.input.targetAudience}`,
          rationale: `Positions ${brandName} as a top authority in ${industry} with grounded evidence.`,
        },
        {
          name: 'Multi-Agent Safety & ROI Governance',
          angle: `Eliminating AI hallucinations and compliance risks before posts go live`,
          rationale: `Addresses core enterprise buyer fear regarding brand reputation & regulatory compliance.`,
        },
        {
          name: 'High-Impact Multi-Channel Case Studies',
          angle: `Why leading ${industry} brands switch to ${brandName}'s Content OS`,
          rationale: `Builds social proof, trust, and drives high CTA conversion.`,
        },
      ],
      channelRoles: {
        linkedin: `B2B thought leadership carousels, architectural blueprints, and executive insights on ${task.input.productOrTopic}`,
        facebook: `Community stories, masterclass event cards, and customer impact highlights for ${task.input.targetAudience}`,
        instagram: `Aesthetic infographic cards, multi-slide visual design frameworks, and link-in-bio registrations`,
        telegram: `Direct subscriber alerts, instant architecture summaries, and key event announcements`,
      },
      publishingCadence: 'Strategic multi-channel cadence timed to AI market research peak engagement windows.',
      contentIdeas: [
        `Why Enterprise Leaders are Choosing ${brandName}'s Grounded ${task.input.productOrTopic}`,
        `3 AI Compliance Checkpoints Every ${industry} Executive Must Implement`,
        `Inside ${brandName}'s Multi-Agent Architecture: How We Prevent Brand Hallucinations`,
        `The Complete Blueprint to Autonomous Social Content Operations`,
      ],
      constraints: [
        `Must include CTA: ${task.input.offerCTA || defaultCTA}`,
        `Must strictly adhere to brand tone (${brandTone}) and avoid prohibited phrases: ${prohibitedPhrases}`,
        `Must include grounded RAG evidence citations in every variant`,
      ],
    };

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: StrategyOutputSchema,
      mockFallback,
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: res.usedMock ? 0.94 : 0.98,
      warnings: res.usedMock ? ['Generated using Strategy Engine fallback.'] : [],
      evidence: brandCtx.evidence,
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v2.0-enhanced-strategy',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const strategyAgent = new StrategyAgent();
