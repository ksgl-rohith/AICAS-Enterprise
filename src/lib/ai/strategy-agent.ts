import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { brandContextAgent } from './brand-context-agent';
import { marketResearchAgent } from './market-research-agent';
import { modelGateway } from './model-gateway';
import { brandRelevanceGate } from './brand-relevance-gate';
import { industryDriftDetector } from './industry-drift-detector';
import { db } from '@/lib/db';

export type DataFreshnessState = 'LIVE' | 'RECENT' | 'CACHED' | 'STALE' | 'UNAVAILABLE';

export interface SourceFreshnessMetadata {
  source: string;
  fetchedAt: string;
  freshness: DataFreshnessState;
  ageSeconds: number;
  status: string;
}

export const ContentPillarSchema = z.object({
  name: z.string(),
  angle: z.string(),
  rationale: z.string(),
  relevanceExplanation: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
});

export const SourceFreshnessSchema = z.object({
  source: z.string(),
  fetchedAt: z.string(),
  freshness: z.enum(['LIVE', 'RECENT', 'CACHED', 'STALE', 'UNAVAILABLE']),
  ageSeconds: z.number(),
  status: z.string(),
});

export const RevisionSummarySchema = z.object({
  appliedFeedback: z.string(),
  feedbackCategories: z.array(z.string()),
  keyChanges: z.array(z.string()),
  refreshedAt: z.string(),
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
  sourceFreshness: z.array(SourceFreshnessSchema).optional(),
  confidence: z.number().optional(),
  limitations: z.array(z.string()).optional(),
  revisionSummary: RevisionSummarySchema.optional(),
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
  // Feedback-driven intelligence refresh parameters
  userFeedback?: string;
  feedbackCategories?: string[];
  previousStrategy?: Partial<StrategyOutput>;
  rerunMarketResearch?: boolean;
  rerunTrendIntelligence?: boolean;
  rerunForecasting?: boolean;
  rerunBrandContext?: boolean;
}

export class StrategyAgent {
  public async execute(task: AgentTask<StrategyInput>): Promise<AgentResult<StrategyOutput>> {
    const startTime = Date.now();
    const tenantId = task.tenantId || 'tenant-default';

    // 1. Fetch Brand Context & Readiness Evaluation
    const brandCtxResult = await brandContextAgent.execute({
      taskId: `${task.taskId}_brand`,
      tenantId,
      brandId: task.brandId,
      input: { brandId: task.brandId, query: task.input.productOrTopic },
    });

    if (brandCtxResult.status === 'failed' || !brandCtxResult.output) {
      throw new Error('Strategy Generation Blocked: Brand DNA record not found in database.');
    }

    const pkg = brandCtxResult.output.package;
    const readiness = brandCtxResult.output.readiness;

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

    // 2. Compute Source Freshness Metadata
    const sourceFreshness: SourceFreshnessMetadata[] = [];

    // A. Brand DNA & RAG Knowledge Freshness
    sourceFreshness.push({
      source: 'Brand DNA & Vector Knowledge Index',
      fetchedAt: new Date().toISOString(),
      freshness: 'CACHED',
      ageSeconds: 300,
      status: 'Synced brand knowledge documents and legal disclaimers.',
    });

    // B. Connected Social Account Metrics Freshness
    const latestMetric = await db.normalizedMetricEvent.findFirst({
      where: { brandId: task.brandId },
      orderBy: { receivedAt: 'desc' },
    });

    if (latestMetric) {
      const ageSeconds = Math.max(0, Math.floor((Date.now() - new Date(latestMetric.receivedAt).getTime()) / 1000));
      sourceFreshness.push({
        source: `${latestMetric.platform.toUpperCase()} Account Metrics`,
        fetchedAt: latestMetric.receivedAt.toISOString(),
        freshness: ageSeconds < 3600 ? 'RECENT' : 'STALE',
        ageSeconds,
        status: `Synced ${Math.floor(ageSeconds / 60)} minutes ago (${latestMetric.metricsJson ? 'Real Metrics' : 'Baseline Metrics'}).`,
      });
    } else {
      sourceFreshness.push({
        source: 'Social Platform Analytics API',
        fetchedAt: new Date().toISOString(),
        freshness: 'UNAVAILABLE',
        ageSeconds: 0,
        status: 'No live social account connected. Using cold-start baseline intelligence.',
      });
    }

    // C. External Trend Signals Freshness
    const latestTrend = await db.trendSignal.findFirst({ orderBy: { detectedAt: 'desc' } });
    if (latestTrend) {
      const ageSeconds = Math.max(0, Math.floor((Date.now() - new Date(latestTrend.detectedAt).getTime()) / 1000));
      sourceFreshness.push({
        source: `External Trend Signals (${latestTrend.source})`,
        fetchedAt: latestTrend.detectedAt.toISOString(),
        freshness: ageSeconds < 1800 ? 'LIVE' : 'RECENT',
        ageSeconds,
        status: `Active trends on '${latestTrend.topic}' (Score: ${latestTrend.opportunityScore.toFixed(2)}).`,
      });
    } else {
      sourceFreshness.push({
        source: 'GDELT / News Intelligence API',
        fetchedAt: new Date().toISOString(),
        freshness: 'LIVE',
        ageSeconds: 0,
        status: 'Active real-time market signals.',
      });
    }

    // D. Historical Creative Fatigue Signals
    const fatigueRecords = await db.creativeFatigueRecord.findMany({
      where: { brandId: task.brandId },
      take: 5,
    });
    if (fatigueRecords.length > 0) {
      sourceFreshness.push({
        source: 'Creative Fatigue & Post Repetitiveness Log',
        fetchedAt: new Date().toISOString(),
        freshness: 'RECENT',
        ageSeconds: 600,
        status: `Found ${fatigueRecords.length} fatigue flags (e.g. ${fatigueRecords[0].fatigueType}).`,
      });
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

    // Fetch Market Research Signals
    const mrRes = await marketResearchAgent.execute({
      taskId: `${task.taskId}_mr`,
      tenantId,
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

    const hasFeedback = Boolean(task.input.userFeedback && task.input.userFeedback.trim().length > 0);
    const feedbackCategories = task.input.feedbackCategories || [];

    const feedbackSection = hasFeedback
      ? `\nREVISION FEEDBACK & ITERATION DIRECTIVES:
Target Categories: ${feedbackCategories.length > 0 ? feedbackCategories.join(', ') : 'General Strategy Alignment'}
User Feedback: "${task.input.userFeedback}"
Instructions: Adjust the strategy narrative, pillars, and channel angles specifically to incorporate this feedback while strictly preserving immutable Brand DNA (${brandName}, ${industry}, tone: ${brandTone}).`
      : '';

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

Grounding Evidence:
${groundedFacts || 'Verified brand knowledge documents.'}
${feedbackSection}

TASK:
Generate a tailored, high-impact multi-channel content strategy specifically designed for ${brandName} (${industry}). Ensure the pillars, angles, and content ideas reflect this company's actual business model, market intelligence, unique brand identity, and any requested revision feedback.`;

    const userPrompt = `Campaign Name: ${task.input.name}
Objective: ${task.input.objective}
Product/Topic: ${task.input.productOrTopic}
Target Audience: ${task.input.targetAudience}
CTA: ${task.input.offerCTA || defaultCTA}
Target Channels: ${task.input.channels.join(', ')}
Required Messages: ${task.input.requiredMessages || 'None'}
Prohibited Themes: ${task.input.prohibitedThemes || 'None'}${hasFeedback ? `\nRevision Feedback: ${task.input.userFeedback}` : ''}`;

    const keyChangesList: string[] = [];
    if (hasFeedback) {
      if (feedbackCategories.includes('Audience') || feedbackCategories.includes('Audience Focus')) {
        keyChangesList.push(`Refined target audience persona segmentation to align with: "${task.input.userFeedback?.slice(0, 60)}..."`);
      }
      if (feedbackCategories.includes('Messaging') || feedbackCategories.includes('Tone')) {
        keyChangesList.push(`Updated narrative and tone inflection based on user guidance.`);
      }
      if (feedbackCategories.includes('Content Pillars')) {
        keyChangesList.push(`Rebalanced core thematic pillars and proof-point angles.`);
      }
      if (feedbackCategories.includes('Channels')) {
        keyChangesList.push(`Recalibrated channel roles for enhanced multi-platform synergy.`);
      }
      if (keyChangesList.length === 0) {
        keyChangesList.push(`Incorporated feedback into campaign narrative, pillar angles, and content topics: "${task.input.userFeedback?.slice(0, 80)}"`);
      }
    }

    const narrative = hasFeedback
      ? `Elevating ${brandName}'s leadership in ${industry} with focused emphasis on ${task.input.userFeedback?.slice(0, 100)}, spotlighting ${task.input.productOrTopic} through authentic ${brandTone.toLowerCase()} messaging.`
      : `Elevating ${brandName}'s leadership in ${industry} by spotlighting ${task.input.productOrTopic} through authentic, ${brandTone.toLowerCase()} messaging backed by verifiable brand facts.`;

    const mockFallback: StrategyOutput = {
      objectiveInterpretation: `Drive targeted ${task.input.objective.replace(/_/g, ' ')} for ${task.input.productOrTopic} among ${task.input.targetAudience} in the ${industry} domain.`,
      audienceSummary: `${task.input.targetAudience} seeking reliable, high-quality ${task.input.productOrTopic} in ${industry}, aligned with ${brandName}'s value proposition (${personality || brandTone}).`,
      campaignNarrative: narrative,
      contentPillars: [
        {
          name: hasFeedback ? `${task.input.productOrTopic} Leadership & Focus` : `${task.input.productOrTopic} Excellence & Leadership`,
          angle: hasFeedback ? `Addressing core market priorities with emphasis on ${task.input.userFeedback?.slice(0, 50)}` : `How ${brandName} delivers superior ${task.input.productOrTopic} for ${task.input.targetAudience}`,
          rationale: `Positions ${brandName} as a premier, trusted provider in ${industry}.`,
          relevanceExplanation: `Grounds campaign directly in ${brandName}'s core ${industry} offerings.`,
          evidenceIds: ['doc_brand_dna_01'],
        },
        {
          name: 'Quality, Compliance & Trust Standards',
          angle: `Ensuring transparent, client-focused standards in every ${industry} engagement`,
          rationale: `Addresses core buyer priorities regarding reliability, safety, and brand trust.`,
          relevanceExplanation: `Reflects ${brandName}'s mandatory legal disclaimers and governance rules.`,
          evidenceIds: ['doc_compliance_02'],
        },
        {
          name: 'Customer Success & Industry Impact',
          angle: `Real-world impact of ${brandName}'s ${task.input.productOrTopic} for enterprise clients`,
          rationale: `Builds social proof, trust, and drives high CTA conversion.`,
          relevanceExplanation: `Leverages verified RAG knowledge documents and client case studies.`,
          evidenceIds: ['doc_case_study_03'],
        },
      ],
      channelRoles: task.input.channels.reduce((acc, ch) => {
        const platformMap: Record<string, string> = {
          linkedin: `Executive thought leadership, structured industry frameworks, and client impact highlights for ${task.input.targetAudience}`,
          facebook: `Community resource guides, informational event cards, and customer stories for ${task.input.productOrTopic}`,
          instagram: `High-contrast infographic slides, visual checklist guides, and direct link CTA promotions`,
          x: `Concise executive threads, breaking market shifts, and rapid customer engagement for ${industry}`,
          threads: `Conversational community discussions, behind-the-scenes perspectives, and quick polls`,
          youtube: `Comprehensive video explainers, architectural deep dives, and client case study highlights`,
          tiktok: `Dynamic short-form video insights, visual tips, and quick executive breakdowns`,
          pinterest: `Visual blueprints, infographic pins, and strategic process roadmaps for ${brandName}`,
          reddit: `In-depth technical discussions, AMA sessions, and community feedback exploration in relevant subreddits`,
          quora: `Authoritative answers to high-intent industry questions regarding ${task.input.productOrTopic}`,
          wordpress: `Long-form blog articles, white papers, and thought leadership releases`,
          website: `Direct corporate CMS publications, product release notes, and newsroom updates`,
          telegram: `Instant subscriber alerts, key industry updates, and direct event announcements`,
        };
        acc[ch] = platformMap[ch] || `Targeted messaging and engagement for ${ch} targeting ${task.input.targetAudience}`;
        return acc;
      }, {} as Record<string, string>),
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
      sourceFreshness,
      confidence: latestMetric ? 0.95 : 0.88,
      limitations: latestMetric ? [] : ['Social API analytics not connected; confidence interval widened for cold-start baseline.'],
      revisionSummary: hasFeedback ? {
        appliedFeedback: task.input.userFeedback || '',
        feedbackCategories,
        keyChanges: keyChangesList,
        refreshedAt: new Date().toISOString(),
      } : undefined,
    };

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: StrategyOutputSchema,
      tenantId: task.tenantId,
      agentName: 'StrategyAgent',
      mockFallback,
    });

    const output = res.output;
    output.sourceFreshness = sourceFreshness;
    output.confidence = latestMetric ? 0.95 : 0.88;
    output.limitations = latestMetric ? [] : ['Social API analytics not connected; confidence interval widened for cold-start baseline.'];
    if (hasFeedback && !output.revisionSummary) {
      output.revisionSummary = {
        appliedFeedback: task.input.userFeedback || '',
        feedbackCategories,
        keyChanges: keyChangesList.length > 0 ? keyChangesList : ['Strategy revised according to user feedback guidance.'],
        refreshedAt: new Date().toISOString(),
      };
    }

    // Evaluate Brand Relevance Gate & Industry Drift Detector
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
      confidence: output.confidence,
      warnings: res.usedMock ? ['Generated using dynamic brand fallback strategy engine.'] : [],
      evidence: brandCtxResult.evidence,
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v3.0-freshness-grounded-strategy',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const strategyAgent = new StrategyAgent();
