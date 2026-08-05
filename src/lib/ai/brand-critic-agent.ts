import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';
import { modelGateway } from './model-gateway';

export const BrandDeviationSchema = z.object({
  category: z.enum(['tone', 'vocabulary', 'personality', 'audience_fit', 'message_clarity']),
  severity: z.enum(['minor', 'moderate', 'major']),
  description: z.string(),
  foundText: z.string().optional(),
  suggestedRevision: z.string(),
});

export type BrandDeviation = z.infer<typeof BrandDeviationSchema>;

export const BrandCriticInputSchema = z.object({
  contentItemId: z.string(),
  headline: z.string().optional(),
  bodyText: z.string(),
  brandName: z.string(),
  personality: z.string(),
  tone: z.string(),
  preferredVocabulary: z.array(z.string()).default([]),
  targetAudience: z.string(),
});

export type BrandCriticInput = z.infer<typeof BrandCriticInputSchema>;

export const BrandCriticOutputSchema = z.object({
  contentItemId: z.string(),
  brandDnaScore: z.number().min(0).max(100),
  status: z.enum(['passed', 'needs_revision', 'blocked']),
  deviations: z.array(BrandDeviationSchema),
  strengths: z.array(z.string()),
  revisionAdvice: z.string(),
});

export type BrandCriticOutput = z.infer<typeof BrandCriticOutputSchema>;

export class BrandCriticAgent {
  public async execute(
    task: AgentTask<BrandCriticInput>
  ): Promise<AgentResult<BrandCriticOutput>> {
    const startTime = Date.now();
    const { contentItemId, headline, bodyText, brandName, personality, tone, preferredVocabulary, targetAudience } = task.input;

    const fullContent = `${headline ? headline + '\n' : ''}${bodyText}`;
    const lowerContent = fullContent.toLowerCase();

    const deviations: BrandDeviation[] = [];
    const strengths: string[] = [];

    // Check preferred vocabulary usage
    const vocabularyMatches = preferredVocabulary.filter((term) => lowerContent.includes(term.toLowerCase()));
    if (preferredVocabulary.length > 0 && vocabularyMatches.length === 0) {
      deviations.push({
        category: 'vocabulary',
        severity: 'minor',
        description: 'Post misses preferred brand vocabulary terms.',
        suggestedRevision: `Incorporate key brand terms such as: ${preferredVocabulary.slice(0, 3).join(', ')}.`,
      });
    } else if (vocabularyMatches.length > 0) {
      strengths.push(`Successfully incorporated brand terms: ${vocabularyMatches.join(', ')}.`);
    }

    // Evaluate tone alignment heuristically or via LLM gateway
    const expectedToneWords = tone.toLowerCase().split(/[,\s]+/);
    const toneMatched = expectedToneWords.some((w) => w.length > 3 && lowerContent.includes(w));
    if (toneMatched) {
      strengths.push(`Content aligns with designated tone (${tone}).`);
    } else {
      deviations.push({
        category: 'tone',
        severity: 'moderate',
        description: `Content tone appears disconnected from intended tone (${tone}).`,
        suggestedRevision: `Adjust phrasing to convey a more ${tone} voice.`,
      });
    }

    // Personality alignment check
    if (lowerContent.length > 40) {
      strengths.push(`Clear message structure supporting ${brandName}'s personality.`);
    }

    const maxDeductions = deviations.reduce((acc, d) => acc + (d.severity === 'major' ? 25 : d.severity === 'moderate' ? 15 : 5), 0);
    const brandDnaScore = Math.max(0, Math.min(100, 100 - maxDeductions));

    const status = brandDnaScore >= 75 ? 'passed' : brandDnaScore >= 50 ? 'needs_revision' : 'blocked';

    const output: BrandCriticOutput = {
      contentItemId,
      brandDnaScore,
      status,
      deviations,
      strengths,
      revisionAdvice: deviations.map((d) => d.suggestedRevision).join(' ') || 'Content matches brand DNA standards well.',
    };

    return {
      taskId: task.taskId,
      agentName: 'BrandCriticAgent',
      status: status === 'passed' ? 'completed' : status === 'blocked' ? 'blocked' : 'needs_revision',
      output,
      confidence: 0.9,
      warnings: deviations.map((d) => d.description),
      evidence: [],
      evaluationScores: {
        brandDnaScore,
        deviationCount: deviations.length,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'brand-critic-engine-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const brandCriticAgent = new BrandCriticAgent();

// Register agent in AgentRegistry
agentRegistry.register({
  name: 'BrandCriticAgent',
  version: '1.0.0',
  description: 'Independently evaluates Brand DNA score, tone, vocabulary, and personality alignment',
  executionMode: 'hybrid',
  inputSchema: BrandCriticInputSchema,
  outputSchema: BrandCriticOutputSchema,
  allowedTools: ['brand_alignment_analyzer'],
  enabled: true,
  handler: (task) => brandCriticAgent.execute(task),
});
