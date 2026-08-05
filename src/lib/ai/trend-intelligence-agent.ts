import { z } from 'zod';
import { AgentResult, AgentTask, createBaseTask } from './agent-contract';
import { agentRegistry } from './agent-registry';
import { EvidenceRecord, EvidenceRecordSchema } from './evidence-model';
import { modelGateway } from './model-gateway';

export const RawSignalSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  source: z.string(),
  sourceType: z.enum(['news', 'search', 'competitor', 'internal_campaign', 'social_listening']),
  publishedAt: z.string(),
  url: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

export type RawSignal = z.infer<typeof RawSignalSchema>;

export const TrendIntelligenceInputSchema = z.object({
  signals: z.array(RawSignalSchema),
  industry: z.string(),
  brandKeywords: z.array(z.string()).default([]),
  targetAudience: z.string(),
  minOpportunityScore: z.number().default(0.4),
});

export type TrendIntelligenceInput = z.input<typeof TrendIntelligenceInputSchema>;

export const TrendOpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  category: z.enum(['evergreen', 'time_sensitive']),
  brandRelevance: z.number().min(0).max(1),
  audienceRelevance: z.number().min(0).max(1),
  freshness: z.number().min(0).max(1),
  businessValue: z.number().min(0).max(1),
  formatFit: z.number().min(0).max(1),
  evidenceConfidence: z.number().min(0).max(1),
  safetyMultiplier: z.number().min(0).max(1),
  saturationPenalty: z.number().min(0).max(1),
  opportunityScore: z.number().min(0).max(1),
  recommendedFormats: z.array(z.string()),
  evidence: z.array(EvidenceRecordSchema),
  rationale: z.string(),
});

export type TrendOpportunity = z.infer<typeof TrendOpportunitySchema>;

export const TrendIntelligenceOutputSchema = z.object({
  opportunities: z.array(TrendOpportunitySchema),
  signalsProcessed: z.number(),
  clustersIdentified: z.number(),
  rejectedCount: z.number(),
});

export type TrendIntelligenceOutput = z.infer<typeof TrendIntelligenceOutputSchema>;

export function calculateTrendScores(
  signal: z.input<typeof RawSignalSchema>,
  brandKeywords: string[],
  industry: string,
  minScore: number
): TrendOpportunity | null {
  const signalKeywords = signal.keywords || [];
  const titleLower = (signal.title + ' ' + signal.summary).toLowerCase();
  const brandMatchCount = brandKeywords.filter((kw) => titleLower.includes(kw.toLowerCase())).length;

  const brandRelevance = Math.min(1.0, 0.4 + (brandMatchCount * 0.2) + (titleLower.includes(industry.toLowerCase()) ? 0.3 : 0));
  const audienceRelevance = Math.min(1.0, 0.5 + (signalKeywords.length * 0.05));

  // Freshness calculation based on days since publishedAt
  const pubDate = new Date(signal.publishedAt).getTime();
  const now = Date.now();
  const daysOld = Math.max(0, (now - pubDate) / (1000 * 60 * 60 * 24));
  const freshness = Math.max(0.1, Math.min(1.0, 1.0 - daysOld * 0.15));

  const businessValue = titleLower.includes('roi') || titleLower.includes('growth') || titleLower.includes('strategy') ? 0.85 : 0.65;
  const formatFit = 0.8;
  const evidenceConfidence = signal.url ? 0.9 : 0.6;
  const safetyMultiplier = titleLower.includes('scandal') || titleLower.includes('lawsuit') ? 0.2 : 1.0;
  const saturationPenalty = signal.sourceType === 'social_listening' ? 0.1 : 0.0;

  const weightedSum =
    brandRelevance * 0.25 +
    audienceRelevance * 0.2 +
    freshness * 0.15 +
    businessValue * 0.2 +
    formatFit * 0.1 +
    evidenceConfidence * 0.1;

  const opportunityScore = Math.max(0, Math.min(1.0, weightedSum * safetyMultiplier - saturationPenalty));

  if (opportunityScore < minScore || evidenceConfidence < 0.3 || safetyMultiplier < 0.5) {
    return null; // Rejected trend
  }

  const category = freshness > 0.7 && daysOld < 3 ? 'time_sensitive' : 'evergreen';

  const evidenceRecord: EvidenceRecord = {
    evidenceId: `ev_trend_${signal.id}`,
    sourceId: signal.id,
    sourceTitle: signal.title,
    sourceType: 'market_signal',
    sourceUri: signal.url,
    retrievedExcerpt: signal.summary,
    publicationDate: signal.publishedAt,
    retrievalDate: new Date().toISOString(),
    trustLevel: signal.sourceType === 'news' ? 'THIRD_PARTY_MEDIA' : 'UNVERIFIED_EXTERNAL',
    tenantId: 'tenant-default',
    brandId: 'brand-default',
    confidence: evidenceConfidence,
  };

  return {
    id: `trend_${signal.id}`,
    title: signal.title,
    summary: signal.summary,
    category,
    brandRelevance,
    audienceRelevance,
    freshness,
    businessValue,
    formatFit,
    evidenceConfidence,
    safetyMultiplier,
    saturationPenalty,
    opportunityScore: Math.round(opportunityScore * 100) / 100,
    recommendedFormats: category === 'time_sensitive' ? ['text_post', 'image_post'] : ['carousel', 'infographic'],
    evidence: [evidenceRecord],
    rationale: `Ranked with score ${opportunityScore.toFixed(2)} based on brand match (${brandMatchCount}) and freshness (${freshness.toFixed(2)}).`,
  };
}

export class TrendIntelligenceAgent {
  public async execute(
    task: AgentTask<TrendIntelligenceInput>
  ): Promise<AgentResult<TrendIntelligenceOutput>> {
    const startTime = Date.now();
    const { signals, industry, brandKeywords, minOpportunityScore } = task.input;

    // Deduplicate signals by title similarity
    const uniqueSignals: z.input<typeof RawSignalSchema>[] = [];
    const seenTitles = new Set<string>();

    for (const signal of signals) {
      const normalizedTitle = signal.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueSignals.push(signal);
      }
    }

    const opportunities: TrendOpportunity[] = [];
    let rejectedCount = 0;

    for (const signal of uniqueSignals) {
      const opp = calculateTrendScores(
        signal,
        brandKeywords || [],
        industry,
        minOpportunityScore || 0.4
      );
      if (opp) {
        // Scope evidence to task tenant/brand
        opp.evidence = opp.evidence.map((ev) => ({
          ...ev,
          tenantId: task.tenantId,
          brandId: task.brandId,
        }));
        opportunities.push(opp);
      } else {
        rejectedCount++;
      }
    }

    // Sort opportunities descending by opportunityScore
    opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);

    const output: TrendIntelligenceOutput = {
      opportunities,
      signalsProcessed: signals.length,
      clustersIdentified: opportunities.length,
      rejectedCount,
    };

    return {
      taskId: task.taskId,
      agentName: 'TrendIntelligenceAgent',
      status: 'completed',
      output,
      confidence: opportunities.length > 0 ? 0.9 : 0.6,
      warnings: rejectedCount > 0 ? [`${rejectedCount} trend signals were filtered out due to low relevance/safety scores.`] : [],
      evidence: opportunities.flatMap((o) => o.evidence),
      evaluationScores: {
        totalSignals: signals.length,
        qualifiedTrends: opportunities.length,
        avgOpportunityScore: opportunities.length ? opportunities.reduce((acc, o) => acc + o.opportunityScore, 0) / opportunities.length : 0,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'deterministic-scoring-engine',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const trendIntelligenceAgent = new TrendIntelligenceAgent();

// Register agent in central AgentRegistry
agentRegistry.register({
  name: 'TrendIntelligenceAgent',
  version: '1.0.0',
  description: 'Ingests, deduplicates, and ranks trend signals with deterministic scoring formulas',
  executionMode: 'hybrid',
  inputSchema: TrendIntelligenceInputSchema,
  outputSchema: TrendIntelligenceOutputSchema,
  allowedTools: ['signal_dedup', 'trend_ranker'],
  enabled: true,
  handler: (task) => trendIntelligenceAgent.execute(task),
});
