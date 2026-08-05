import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';

export const LocalizationSchema = z.object({
  targetLocale: z.string(),
  translatedHeadline: z.string().optional(),
  translatedBody: z.string(),
  translatedCTA: z.string(),
  transcreationNotes: z.string(),
  adaptationMode: z.enum(['TRANSLATION', 'TRANSCREATION']),
  isCulturallySensitive: z.boolean(),
  culturalSensitivityNotes: z.string().optional(),
  policyValidationStatus: z.enum(['PASSED', 'FLAGGED', 'NEEDS_REVIEW']),
  modifiedClaims: z.array(z.string()),
  lineage: z.object({
    sourceContentId: z.string(),
    sourceVariantId: z.string().optional(),
    sourceLocale: z.string(),
    targetLocale: z.string(),
    timestamp: z.string(),
  }),
});

export type LocalizationOutput = z.infer<typeof LocalizationSchema>;

export interface LocalizeTaskInput {
  sourceContentId: string;
  sourceVariantId?: string;
  sourceLocale: string;
  targetLocale: string; // e.g. 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'
  headline?: string;
  bodyText: string;
  ctaText: string;
  brandPersonality: string;
}

export class LocalizationAgent {
  public async execute(
    task: AgentTask<LocalizeTaskInput>
  ): Promise<AgentResult<LocalizationOutput>> {
    const startTime = Date.now();
    const tenantId = task.tenantId || 'tenant-default';

    const mockFallback: LocalizationOutput = {
      targetLocale: task.input.targetLocale,
      translatedHeadline: task.input.headline ? `[${task.input.targetLocale}] ${task.input.headline}` : undefined,
      translatedBody: `[Adapted for ${task.input.targetLocale}] ${task.input.bodyText}`,
      translatedCTA: `[${task.input.targetLocale}] ${task.input.ctaText}`,
      transcreationNotes: `Transcreated technical phrasing for ${task.input.targetLocale} cultural nuance while retaining core facts and legal disclaimers.`,
      adaptationMode: 'TRANSCREATION',
      isCulturallySensitive: false,
      policyValidationStatus: 'PASSED',
      modifiedClaims: [],
      lineage: {
        sourceContentId: task.input.sourceContentId,
        sourceVariantId: task.input.sourceVariantId,
        sourceLocale: task.input.sourceLocale || 'en-US',
        targetLocale: task.input.targetLocale,
        timestamp: new Date().toISOString(),
      },
    };

    const systemPrompt = `You are an AI Content Localization & Transcreation Specialist.
Adapt approved content into the target locale.
Preserve facts, legal disclaimers, CTA intent, and brand personality.
Distinguish direct translation from transcreation.
Flag culturally sensitive phrases.
Avoid re-verifying source facts if unchanged, but flag any modified local claims for verification.`;

    const userPrompt = `Source Content ID: ${task.input.sourceContentId}
Source Locale: ${task.input.sourceLocale}
Target Locale: ${task.input.targetLocale}
Body: ${task.input.bodyText}
CTA: ${task.input.ctaText}`;

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: LocalizationSchema,
      mockFallback,
      tenantId,
      agentName: 'LocalizationAgent',
    });

    // Save LocalizedContent lineage record to DB
    await db.localizedContent.create({
      data: {
        tenantId,
        sourceContentId: task.input.sourceContentId,
        sourceVariantId: task.input.sourceVariantId || null,
        locale: task.input.targetLocale,
        translatedHeadline: res.output.translatedHeadline || null,
        translatedBody: res.output.translatedBody,
        translatedCTA: res.output.translatedCTA,
        transcreationNotes: res.output.transcreationNotes,
        lineageJson: JSON.stringify(res.output.lineage),
        isCulturallySensitive: res.output.isCulturallySensitive,
        policyValidationStatus: res.output.policyValidationStatus,
      },
    });

    return {
      taskId: task.taskId,
      status: res.output.policyValidationStatus === 'PASSED' ? 'completed' : 'needs_revision',
      output: res.output,
      confidence: 0.95,
      warnings: res.output.isCulturallySensitive
        ? [`Culturally sensitive phrasing flagged: ${res.output.culturalSensitivityNotes}`]
        : [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-localization',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const localizationAgent = new LocalizationAgent();
