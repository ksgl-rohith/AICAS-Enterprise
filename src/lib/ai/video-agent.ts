import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';
import { videoRenderingProvider } from '@/lib/media/video-rendering-provider';

export const SceneSpecSchema = z.object({
  sceneNumber: z.number(),
  durationSec: z.number(),
  visualDescription: z.string(),
  audioScript: z.string(),
  textOverlay: z.string(),
});

export const VideoPackageSchema = z.object({
  hook: z.string(),
  script: z.string(),
  sceneSequence: z.array(SceneSpecSchema),
  storyboard: z.array(z.string()),
  brollSuggestions: z.array(z.string()),
  onScreenText: z.string(),
  voiceoverText: z.string(),
  subtitleCaptionContent: z.string(),
  thumbnailBrief: z.string(),
  durationEstimateSeconds: z.number(),
  aspectRatios: z.array(z.string()),
  safeAreaInstructions: z.string(),
  accessibilityNotes: z.string(),
  consistencyValidation: z.object({
    isConsistent: z.boolean(),
    score: z.number(),
    issues: z.array(z.string()),
  }),
});

export type VideoPackageOutput = z.infer<typeof VideoPackageSchema>;

export interface VideoTaskInput {
  contentItemId: string;
  topic: string;
  targetAudience: string;
  ctaText: string;
  evidenceRefs?: string[];
}

export class VideoAgent {
  public async execute(
    task: AgentTask<VideoTaskInput>
  ): Promise<AgentResult<VideoPackageOutput>> {
    const startTime = Date.now();
    const tenantId = task.tenantId || 'tenant-default';

    const mockFallback: VideoPackageOutput = {
      hook: 'Stop building single-prompt AI wrappers in enterprise production.',
      script: 'Scene 1: Hook on screen. Scene 2: Show multi-agent council workflow. Scene 3: Highlight policy-gated publishing. Scene 4: Call to Action.',
      sceneSequence: [
        {
          sceneNumber: 1,
          durationSec: 3,
          visualDescription: 'Animated dark-mode code terminal showing LLM prompt failure alert.',
          audioScript: 'Why single LLM prompts fail enterprise brand safety tests.',
          textOverlay: 'AI Prompt Failure vs Multi-Agent Governance',
        },
        {
          sceneNumber: 2,
          durationSec: 8,
          visualDescription: 'Diagram of Quality Council: Compliance, Brand, and Fact-Check agents.',
          audioScript: 'Enterprise platforms require multi-agent review with factual verification before publishing.',
          textOverlay: 'Multi-Agent Quality Council Verification',
        },
        {
          sceneNumber: 3,
          durationSec: 4,
          visualDescription: 'SaaS dashboard showing approved content schedule.',
          audioScript: 'Schedule your custom enterprise AI governance audit today.',
          textOverlay: 'Schedule Enterprise Governance Audit',
        },
      ],
      storyboard: [
        'Frame 1: High contrast text overlay in 9:16 safe center area.',
        'Frame 2: Screen capture animation of AICAS multi-agent flow.',
        'Frame 3: Brand logo & CTA button placement.',
      ],
      brollSuggestions: [
        'tech_server_room_macro.mp4',
        'developer_dashboard_coding.mp4',
        'data_visualization_graphs.mp4',
      ],
      onScreenText: 'Multi-Agent AI Governance for Enterprise SaaS | AICAS Enterprise',
      voiceoverText: 'Why single LLM prompts fail enterprise brand safety. Discover multi-agent governance.',
      subtitleCaptionContent: '1\n00:00:00,000 --> 00:00:03,000\nWhy single LLM prompts fail enterprise brand safety tests.\n\n2\n00:00:03,000 --> 00:00:11,000\nEnterprise platforms require multi-agent review with factual verification.\n\n3\n00:00:11,000 --> 00:00:15,000\nSchedule your custom enterprise AI governance audit today.',
      thumbnailBrief: 'Sleek dark mode graphic with title: "Multi-Agent AI Governance Strategy 2026"',
      durationEstimateSeconds: 15,
      aspectRatios: ['9:16', '1:1', '16:9'],
      safeAreaInstructions: 'Keep hook title and captions inside the central 80% safe zone for TikTok and Instagram Reels.',
      accessibilityNotes: 'Captions included with high contrast background box for WCAG 2.1 AA compliance.',
      consistencyValidation: {
        isConsistent: true,
        score: 0.98,
        issues: [],
      },
    };

    const systemPrompt = `You are a Short-Form Video Strategy & Script Agent.
Generate a structured short-form video package containing hook, script, scene sequence, storyboard, B-roll suggestions, on-screen text, voiceover, caption content, duration estimate, platform aspect ratios, safe-area instructions, and accessibility notes.
Validate script/caption/CTA consistency.`;

    const userPrompt = `Content Item ID: ${task.input.contentItemId}
Topic: ${task.input.topic}
Audience: ${task.input.targetAudience}
CTA: ${task.input.ctaText}`;

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: VideoPackageSchema,
      mockFallback,
      tenantId,
      agentName: 'VideoAgent',
    });

    // 2. Call Video Rendering Provider interface (mock preview or provider)
    const renderRes = await videoRenderingProvider.renderVideo({
      tenantId,
      packageId: task.input.contentItemId,
      script: res.output.script,
      aspectRatio: res.output.aspectRatios[0] || '9:16',
      voiceoverText: res.output.voiceoverText,
      onScreenText: res.output.onScreenText,
      brollTags: res.output.brollSuggestions,
    });

    // 3. Save VideoPackage to DB
    await db.videoPackage.create({
      data: {
        tenantId,
        contentItemId: task.input.contentItemId,
        hook: res.output.hook,
        script: res.output.script,
        sceneSequenceJson: JSON.stringify(res.output.sceneSequence),
        storyboardJson: JSON.stringify(res.output.storyboard),
        brollSuggestionsJson: JSON.stringify(res.output.brollSuggestions),
        onScreenText: res.output.onScreenText,
        voiceoverText: res.output.voiceoverText,
        subtitleCaptionContent: res.output.subtitleCaptionContent,
        thumbnailBrief: res.output.thumbnailBrief,
        durationEstimateSeconds: res.output.durationEstimateSeconds,
        aspectRatiosJson: JSON.stringify(res.output.aspectRatios),
        safeAreaInstructions: res.output.safeAreaInstructions,
        accessibilityNotes: res.output.accessibilityNotes,
        consistencyValidationJson: JSON.stringify(res.output.consistencyValidation),
        renderingProviderStatus: renderRes.status,
      },
    });

    return {
      taskId: task.taskId,
      status: res.output.consistencyValidation.isConsistent ? 'completed' : 'needs_revision',
      output: res.output,
      confidence: res.output.consistencyValidation.score,
      warnings: res.output.consistencyValidation.issues,
      evidence: (task.input.evidenceRefs || []).map((e) => ({ sourceText: e })),
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-video',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const videoAgent = new VideoAgent();
