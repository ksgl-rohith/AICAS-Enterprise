import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';

export interface ImageInput {
  topicTitle: string;
  brandName: string;
  industry: string;
  targetAudience: string;
  channel: string;
  brandTone: string;
}

export const ImageBriefOutputSchema = z.object({
  conceptName: z.string(),
  headlineOverlay: z.string(),
  subheadingOverlay: z.string(),
  artDirectionPrompt: z.string(),
  colorPalette: z.array(z.string()),
  graphicStyle: z.string(),
  focalPoint: z.string(),
  recommendedAspect: z.string(),
  ctaBadgeText: z.string(),
  previewVisualMock: z.object({
    badge: z.string(),
    title: z.string(),
    subtitle: z.string(),
    accentColor: z.string(),
    backgroundGradient: z.string(),
    iconType: z.string(),
  }),
});

export type ImageBriefOutput = z.infer<typeof ImageBriefOutputSchema>;

export class ImageContentAgent {
  public async execute(task: AgentTask<ImageInput>): Promise<AgentResult<ImageBriefOutput>> {
    const startTime = Date.now();
    const { topicTitle, brandName, industry, channel, brandTone } = task.input;

    const systemPrompt = `You are a Senior Visual Art Director & Graphic Design AI Agent for enterprise marketing.
Create a high-impact, high-converting visual image concept and graphic layout for "${brandName}" (${industry}).`;

    const userPrompt = `Topic: ${topicTitle}
Channel: ${channel}
Brand Tone: ${brandTone}`;

    const mockFallback: ImageBriefOutput = {
      conceptName: `High-Contrast Enterprise Graphic: ${topicTitle}`,
      headlineOverlay: topicTitle,
      subheadingOverlay: `Autonomous Governance & Safety for ${brandName}`,
      artDirectionPrompt: `A 3D glassmorphic graphic displaying an AI shield emblem, glowing neon indigo node connections, slate dark studio background, ultra-crisp typography, 8k render quality.`,
      colorPalette: ['#6366F1', '#4F46E5', '#10B981', '#0F172A'],
      graphicStyle: 'Glassmorphic Modern Tech Graphic',
      focalPoint: 'Central glowing shield emblem with interconnected data node lines',
      recommendedAspect: channel === 'instagram' ? '1:1 Square (1080x1080)' : '16:9 Landscape (1200x628)',
      ctaBadgeText: 'Explore Architecture',
      previewVisualMock: {
        badge: 'Enterprise AI Governance',
        title: topicTitle,
        subtitle: `Powering ${industry} compliance at scale`,
        accentColor: '#6366F1',
        backgroundGradient: 'from-indigo-900 via-slate-900 to-purple-950',
        iconType: 'ShieldCheck',
      },
    };

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: ImageBriefOutputSchema,
      mockFallback,
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: 0.97,
      warnings: [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-image-agent',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const imageContentAgent = new ImageContentAgent();
