import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';
import { analyticsIngestionService } from '@/lib/analytics/normalized-analytics';

export const AnalyticsInsightSchema = z.object({
  findingType: z.enum([
    'STRONG_HOOK',
    'WEAK_CTA',
    'CHANNEL_MISMATCH',
    'AUDIENCE_MISMATCH',
    'VISUAL_FATIGUE',
    'TIMING_ISSUE',
    'CONTENT_SATURATION',
  ]),
  observation: z.string(),
  baselineComparison: z.string(),
  causalEvidenceLevel: z.enum(['CORRELATION_ONLY', 'QUALIFIED_OBSERVATION', 'CAUSAL_EXPERIMENT']),
  confidence: z.number(),
  impactEstimate: z.string(),
  recommendedInvestigation: z.string(),
});

export const AnalyticsReportSchema = z.object({
  overallSummary: z.string(),
  performanceVsBaseline: z.string(),
  insights: z.array(AnalyticsInsightSchema),
  confidence: z.number(),
  limitations: z.string(),
});

export type AnalyticsReportOutput = z.infer<typeof AnalyticsReportSchema>;

export class AnalyticsAgent {
  public async execute(
    task: AgentTask<{ brandId: string; campaignId?: string }>
  ): Promise<AgentResult<AnalyticsReportOutput>> {
    const startTime = Date.now();
    const tenantId = task.tenantId || 'tenant-default';

    // Fetch normalized metrics
    const metricsEvents = await analyticsIngestionService.getTenantMetrics(tenantId, task.brandId);

    const mockFallback: AnalyticsReportOutput = {
      overallSummary: `Analyzed ${metricsEvents.length || 12} performance snapshots across active social channels. Identified 3 key performance drivers and 2 optimizations.`,
      performanceVsBaseline: 'CTR is +24% above historical industry baseline (3.1% vs 2.5%), driven primarily by technical carousels.',
      insights: [
        {
          findingType: 'STRONG_HOOK',
          observation: 'Question-based contrast hooks in technical posts yield 2.8x higher 3-second engagement.',
          baselineComparison: '3.1% CTR vs 1.1% baseline on static text posts.',
          causalEvidenceLevel: 'QUALIFIED_OBSERVATION',
          confidence: 0.92,
          impactEstimate: '+1.8% average CTR lift across campaign',
          recommendedInvestigation: 'Run A/B experiment comparing question hooks vs stat-first hooks.',
        },
        {
          findingType: 'WEAK_CTA',
          observation: 'Generic "Click Link in Bio" CTAs on Instagram yield 0.3% click-through.',
          baselineComparison: '-65% lower click rate compared to direct resource link CTAs on LinkedIn.',
          causalEvidenceLevel: 'CORRELATION_ONLY',
          confidence: 0.88,
          impactEstimate: '-120 prospective leads per month',
          recommendedInvestigation: 'Test explicit value-driven CTAs ("Download 2026 SaaS Benchmark Report").',
        },
      ],
      confidence: 0.90,
      limitations: 'Correlation observed; controlled A/B experiment required to verify causal relationship.',
    };

    const systemPrompt = `You are a Principal AI Performance Analytics Specialist.
Analyze campaign metric events against baselines.
CRITICAL MANDATE:
- Distinguish observation/correlation from causal evidence.
- Identify strong hooks, weak CTAs, channel/audience mismatch, visual fatigue, timing issues, or content saturation.
- Never claim causation from correlation alone.`;

    const userPrompt = `Tenant ID: ${tenantId}
Brand ID: ${task.brandId}
Campaign ID: ${task.input.campaignId || 'All Campaigns'}
Total Metric Events: ${metricsEvents.length}`;

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: AnalyticsReportSchema,
      mockFallback,
      tenantId,
      agentName: 'AnalyticsAgent',
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: res.output.confidence,
      warnings: res.usedMock ? ['Analytics report generated via fallback simulation.'] : [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-analytics',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const analyticsAgent = new AnalyticsAgent();
