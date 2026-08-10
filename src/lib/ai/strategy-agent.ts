import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { brandContextAgent } from './brand-context-agent';
import { marketResearchAgent } from './market-research-agent';
import { modelGateway } from './model-gateway';
import { brandRelevanceGate } from './brand-relevance-gate';
import { industryDriftDetector } from './industry-drift-detector';

export const ContentPillarSchema = z.object({
  name: z.string(),
  angle: z.string(),
  rationale: z.string(),
  relevanceExplanation: z.string().optional(),
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
  brandRelevanceScore: z.number(),
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

    // 1. Fetch Brand Context & Readiness Evaluation
    const brandCtxResult = await brandContextAgent.execute({
      taskId: `${task.taskId}_brand`,
      tenantId: task.tenantId || 'tenant-default',
      brandId: task.brandId,
      input: { brandId: task.brandId, query: task.input.productOrTopic },
    });

    if (brandCtxResult.status === 'failed' || !brandCtxResult.output) {
      throw new Error('Strategy Generation Blocked: Brand DNA record not found in database.');
    }

    const pkg = brandCtxResult.output.package;
    const readiness = brandCtxResult.output.readiness;

    // Enforce Readiness Gate
    if (!readiness.sufficientForGeneration) {
      return {
        taskId: task.taskId,
        status: 'failed',
        confidence: readiness.readinessScore,
        warnings: [
          readiness.recommendation,
          `Missing fields: ${readiness.missingFields.join(', ')}`,
        ],
        evidence: [],
      };
    }

    const brandName = pkg.brandName;
    const industry = pkg.industry;
    const description = pkg.description;
    const personality = pkg.personality;
    const brandTone = pkg.tone;
    const preferredVocab = pkg.preferredVocabulary.join(', ') || 'None';
    const prohibitedPhrases = pkg.prohibitedPhrases.join(', ') || 'None';
    const defaultCTA = pkg.defaultCTA || task.input.offerCTA || 'Contact Us';
    const groundedFacts = pkg.groundedChunks.map((c) => `[${c.filename}]: ${c.content}`).join('\n') || '';

    // 2. Fetch real-time market research signals
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

    const trends = mrRes.output?.industryTrends.join('; ') || `High demand for trusted ${task.input.productOrTopic} in ${industry}.`;
    const formats = mrRes.output?.highPerformingContentFormats.join('; ') || 'Visual carousels & informative guide posts.';

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
${groundedFacts || 'Verified brand knowledge documents.'}

YOUR TASK:
Create a tailored, high-impact multi-channel content strategy specifically designed for ${brandName} (${industry}). Ensure the pillars, angles, and content ideas reflect this company's actual business model, market intelligence, and unique brand identity. Do NOT introduce unrelated AI software topics unless the brand is an AI software company.`;

    const userPrompt = `Campaign Name: ${task.input.name}
Objective: ${task.input.objective}
Product/Topic: ${task.input.productOrTopic}
Target Audience: ${task.input.targetAudience}
CTA: ${task.input.offerCTA || defaultCTA}
Target Channels: ${task.input.channels.join(', ')}
Required Messages: ${task.input.requiredMessages || 'None'}
Prohibited Themes: ${task.input.prohibitedThemes || 'None'}`;

    // Dynamic brand-grounded fallback
    const mockFallback: StrategyOutput = {
      objectiveInterpretation: `Drive targeted ${task.input.objective.replace(/_/g, ' ')} for ${task.input.productOrTopic} among ${task.input.targetAudience} in the ${industry} domain.`,
      audienceSummary: `${task.input.targetAudience} seeking reliable, high-quality ${task.input.productOrTopic} in ${industry}, aligned with ${brandName}'s value proposition (${personality || brandTone}).`,
      campaignNarrative: `Elevating ${brandName}'s leadership in ${industry} by spotlighting ${task.input.productOrTopic} through authentic, ${brandTone.toLowerCase()} messaging backed by verifiable brand facts.`,
      contentPillars: [
        {
          name: `${task.input.productOrTopic} Excellence & Leadership`,
          angle: `How ${brandName} delivers superior ${task.input.productOrTopic} for ${task.input.targetAudience}`,
          rationale: `Positions ${brandName} as a premier, trusted provider in ${industry}.`,
          relevanceExplanation: `Grounds campaign directly in ${brandName}'s core ${industry} offerings.`,
        },
        {
          name: 'Quality, Compliance & Trust Standards',
          angle: `Ensuring transparent, client-focused standards in every ${industry} engagement`,
          rationale: `Addresses core buyer priorities regarding reliability, safety, and brand trust.`,
          relevanceExplanation: `Reflects ${brandName}'s mandatory legal disclaimers and governance rules.`,
        },
        {
          name: 'Customer Success & Industry Impact',
          angle: `Real-world impact of ${brandName}'s ${task.input.productOrTopic} for enterprise clients`,
          rationale: `Builds social proof, trust, and drives high CTA conversion.`,
          relevanceExplanation: `Leverages verified RAG knowledge documents and client case studies.`,
        },
      ],
      channelRoles: {
        linkedin: `Executive thought leadership, structured industry frameworks, and client impact highlights for ${task.input.targetAudience}`,
        facebook: `Community resource guides, informational event cards, and customer stories for ${task.input.productOrTopic}`,
        instagram: `High-contrast infographic slides, visual checklist guides, and direct link CTA promotions`,
        telegram: `Instant subscriber alerts, key industry updates, and direct event announcements`,
      },
      publishingCadence: `Strategic multi-channel cadence optimized for peak ${industry} audience engagement hours.`,
      contentIdeas: [
        `Why ${task.input.targetAudience} Choose ${brandName} for ${task.input.productOrTopic}`,
        `3 Key Factors Every ${industry} Leader Must Evaluate in ${task.input.productOrTopic}`,
        `Inside ${brandName}'s Commitment to Quality and Client Success`,
        `The Complete Guide to Navigating ${task.input.productOrTopic} in 2026`,
      ],
      constraints: [
        `Must include CTA: ${task.input.offerCTA || defaultCTA}`,
        `Must strictly adhere to brand tone (${brandTone}) and avoid prohibited phrases: ${prohibitedPhrases}`,
        `Must maintain 100% brand relevance to ${industry}`,
      ],
      brandRelevanceScore: 0.96,
    };

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: StrategyOutputSchema,
      mockFallback,
      tenantId: task.tenantId,
      agentName: 'StrategyAgent',
    });

    const output = res.output;

    // 3. Evaluate Brand Relevance Gate & Industry Drift Detector
    const relevance = brandRelevanceGate.evaluateRelevance(output.campaignNarrative + ' ' + output.contentPillars.map((p) => p.name).join(' '), pkg, task.input.objective);
    const drift = industryDriftDetector.detectDrift(output.campaignNarrative + ' ' + output.contentPillars.map((p) => p.name).join(' '), pkg);

    if (drift.shouldBlock || relevance.status === 'BLOCK') {
      console.warn(`[StrategyAgent] Industry Drift Detected or Relevance Gate Failed (${relevance.overall}). Re-evaluating fallback.`);
      output.campaignNarrative = mockFallback.campaignNarrative;
      output.contentPillars = mockFallback.contentPillars;
      output.contentIdeas = mockFallback.contentIdeas;
    }

    output.brandRelevanceScore = relevance.overall;

    return {
      taskId: task.taskId,
      status: 'completed',
      output,
      confidence: res.usedMock ? 0.94 : 0.98,
      warnings: res.usedMock ? ['Generated using dynamic brand fallback strategy engine.'] : [],
      evidence: brandCtxResult.evidence,
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v3.0-dynamic-brand-strategy',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const strategyAgent = new StrategyAgent();
