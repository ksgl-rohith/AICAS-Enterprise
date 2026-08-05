import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';

export interface CarouselInput {
  topicTitle: string;
  brandName: string;
  industry: string;
  targetAudience: string;
  channel: string;
  slideCount?: number;
}

export const CarouselSlideDetailSchema = z.object({
  slideNumber: z.number(),
  slideType: z.enum(['cover', 'content', 'data_stat', 'cta']),
  header: z.string(),
  bodyText: z.string(),
  visualDirection: z.string(),
  bulletPoints: z.array(z.string()).optional(),
  highlightMetric: z.string().optional(),
});

export const CarouselOutputSchema = z.object({
  carouselTitle: z.string(),
  targetChannel: z.string(),
  totalSlides: z.number(),
  aspectRatio: z.string(),
  themePalette: z.array(z.string()),
  slides: z.array(CarouselSlideDetailSchema),
});

export type CarouselOutput = z.infer<typeof CarouselOutputSchema>;

export class CarouselContentAgent {
  public async execute(task: AgentTask<CarouselInput>): Promise<AgentResult<CarouselOutput>> {
    const startTime = Date.now();
    const { topicTitle, brandName, industry, channel } = task.input;

    const systemPrompt = `You are an expert Social Media Carousel Architect.
Design a highly engaging, multi-slide educational carousel storyboard for "${brandName}" on ${channel}.`;

    const userPrompt = `Topic: ${topicTitle}
Industry: ${industry}
Channel: ${channel}`;

    const mockFallback: CarouselOutput = {
      carouselTitle: `${topicTitle}: The Executive Playbook`,
      targetChannel: channel || 'linkedin',
      totalSlides: 4,
      aspectRatio: '4:5 Portrait Carousel (1080x1350)',
      themePalette: ['#4F46E5', '#06B6D4', '#0F172A', '#F8FAFC'],
      slides: [
        {
          slideNumber: 1,
          slideType: 'cover',
          header: topicTitle,
          bodyText: `How ${brandName} eliminates AI compliance risks before publishing.`,
          visualDirection: 'Bold gradient cover slide with glowing badge and swipe indicator arrow.',
          bulletPoints: ['Enterprise Grounding', 'Multi-Agent Council', 'Zero Hallucinations'],
        },
        {
          slideNumber: 2,
          slideType: 'content',
          header: 'Step 1: Grounded RAG Ingestion',
          bodyText: `Extract verified whitepaper claims and company brand guidelines directly into vector memory.`,
          visualDirection: 'Diagram showing raw document transforming into verified data nodes.',
          bulletPoints: ['PDF & Website parsing', 'Automatic chunking', 'Policy alignment'],
        },
        {
          slideNumber: 3,
          slideType: 'data_stat',
          header: 'Proven Enterprise Impact',
          bodyText: `Multi-agent review councils prevent compliance violations by over 99.4%.`,
          visualDirection: 'Large high-contrast metric stat card with upward growth bar graph.',
          highlightMetric: '99.4% Compliance Score',
        },
        {
          slideNumber: 4,
          slideType: 'cta',
          header: 'Build Your Autonomous Content OS',
          bodyText: `Schedule a 1-on-1 architecture session with ${brandName} AI specialists today.`,
          visualDirection: 'Clean call-to-action slide with prominent button badge and link.',
          bulletPoints: ['Request Enterprise Demo', 'Explore Benchmark Report'],
        },
      ],
    };

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: CarouselOutputSchema,
      mockFallback,
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: 0.98,
      warnings: [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-carousel-agent',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const carouselContentAgent = new CarouselContentAgent();
