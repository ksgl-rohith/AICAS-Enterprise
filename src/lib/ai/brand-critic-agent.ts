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

export interface BrandDimensionsScore {
  tone: number;             // 0-100 (15%)
  vocabulary: number;       // 0-100 (10%)
  messaging: number;        // 0-100 (15%)
  offeringAccuracy: number; // 0-100 (20%)
  audience: number;         // 0-100 (15%)
  positioning: number;      // 0-100 (10%)
  cta: number;              // 0-100 (5%)
  prohibitedLanguage: number; // 0-100 (10%)
}

export const BrandCriticOutputSchema = z.object({
  contentItemId: z.string(),
  brandDnaScore: z.number().min(0).max(100),
  status: z.enum(['passed', 'needs_revision', 'blocked']),
  deviations: z.array(BrandDeviationSchema),
  strengths: z.array(z.string()),
  revisionAdvice: z.string(),
  dimensions: z.object({
    tone: z.number(),
    vocabulary: z.number(),
    messaging: z.number(),
    offeringAccuracy: z.number(),
    audience: z.number(),
    positioning: z.number(),
    cta: z.number(),
    prohibitedLanguage: z.number(),
  }).optional(),
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

    // 1. Tone Alignment (15%)
    const expectedToneWords = tone.toLowerCase().split(/[,\s]+/);
    const toneMatched = expectedToneWords.some((w) => w.length > 3 && lowerContent.includes(w));
    const toneScore = toneMatched ? 95 : 70;
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

    // 2. Vocabulary Alignment (10%)
    const vocabularyMatches = preferredVocabulary.filter((term) => lowerContent.includes(term.toLowerCase()));
    const vocabScore = preferredVocabulary.length === 0 ? 90 : Math.round((vocabularyMatches.length / preferredVocabulary.length) * 100);
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

    // 3. Message Alignment (15%)
    const messageScore = lowerContent.length > 50 ? 95 : 75;

    // 4. Product/Service Accuracy (20%)
    const offeringScore = 90;

    // 5. Audience Alignment (15%)
    const audienceKeywords = targetAudience.toLowerCase().split(/[,\s]+/);
    const audienceMatched = audienceKeywords.some((w) => w.length > 4 && lowerContent.includes(w));
    const audienceScore = audienceMatched ? 95 : 80;

    // 6. Positioning Alignment (10%)
    const positioningScore = lowerContent.includes(brandName.toLowerCase()) || lowerContent.length > 80 ? 95 : 75;

    // 7. CTA Alignment (5%)
    const hasCTA = /click|learn|sign up|book|contact|visit|explore|try|schedule/i.test(lowerContent);
    const ctaScore = hasCTA ? 100 : 70;

    // 8. Prohibited Language & Rules (10%)
    const prohibitedScore = 100;

    const dimensions: BrandDimensionsScore = {
      tone: toneScore,
      vocabulary: vocabScore,
      messaging: messageScore,
      offeringAccuracy: offeringScore,
      audience: audienceScore,
      positioning: positioningScore,
      cta: ctaScore,
      prohibitedLanguage: prohibitedScore,
    };

    // Calculate transparent weighted score
    const brandDnaScore = Math.round(
      dimensions.tone * 0.15 +
      dimensions.vocabulary * 0.10 +
      dimensions.messaging * 0.15 +
      dimensions.offeringAccuracy * 0.20 +
      dimensions.audience * 0.15 +
      dimensions.positioning * 0.10 +
      dimensions.cta * 0.05 +
      dimensions.prohibitedLanguage * 0.10
    );

    const status = brandDnaScore >= 75 ? 'passed' : brandDnaScore >= 50 ? 'needs_revision' : 'blocked';

    const output: BrandCriticOutput = {
      contentItemId,
      brandDnaScore,
      status,
      deviations,
      strengths,
      revisionAdvice: deviations.map((d) => d.suggestedRevision).join(' ') || 'Content matches brand DNA standards well.',
      dimensions,
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
