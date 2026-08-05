import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { brandContextAgent } from './brand-context-agent';
import { modelGateway } from './model-gateway';

export const CarouselSlideSchema = z.object({
  slideNumber: z.number(),
  title: z.string(),
  content: z.string(),
  visualDirection: z.string(),
});

export const PlatformVariantSchema = z.object({
  channel: z.enum(['linkedin', 'facebook', 'instagram', 'telegram']),
  headline: z.string().optional(),
  hook: z.string(),
  bodyText: z.string(),
  ctaText: z.string(),
  hashtags: z.array(z.string()),
  altText: z.string().optional(),
  visualConcept: z.string().optional(),
  carouselSlides: z.array(CarouselSlideSchema).optional(),
});

export const CopywritingOutputSchema = z.object({
  title: z.string(),
  coreIdea: z.string(),
  contentPillar: z.string(),
  format: z.string(),
  variants: z.array(PlatformVariantSchema),
});

export type CopywritingOutput = z.infer<typeof CopywritingOutputSchema>;
export type PlatformVariant = z.infer<typeof PlatformVariantSchema>;

export interface CopywritingInput {
  brandId: string;
  campaignId: string;
  topicTitle: string;
  contentPillar: string;
  targetAudience: string;
  format: 'text_post' | 'image_post' | 'carousel' | 'video_script';
  defaultCTA: string;
  channels: ('linkedin' | 'facebook' | 'instagram' | 'telegram')[];
}

export class CopywritingAgent {
  public async execute(task: AgentTask<CopywritingInput>): Promise<AgentResult<CopywritingOutput>> {
    const startTime = Date.now();
    
    // Fetch brand context & RAG evidence
    const brandCtx = await brandContextAgent.execute({
      taskId: `${task.taskId}_brand`,
      brandId: task.brandId,
      input: { brandId: task.brandId, query: task.input.topicTitle },
    });

    const brandName = brandCtx.output?.brandName || 'Brand';
    const industry = brandCtx.output?.industry || 'General Industry';
    const description = brandCtx.output?.description || '';
    const personality = brandCtx.output?.personality || '';
    const brandTone = brandCtx.output?.tone || 'Professional';
    const preferredVocab = brandCtx.output?.preferredVocabulary?.join(', ') || 'None';
    const prohibitedPhrases = brandCtx.output?.prohibitedPhrases || [];
    const requiredDisclaimers = brandCtx.output?.requiredDisclaimers || [];
    const cta = task.input.defaultCTA || brandCtx.output?.defaultCTA || 'Learn More';
    const groundedFacts = brandCtx.output?.groundedChunks?.map((c) => `[${c.filename}]: ${c.content}`).join('\n') || '';

    const systemPrompt = `You are an expert Social Media Copywriter and Content Designer for "${brandName}".
Industry: ${industry}
Company Overview: ${description || 'Not specified'}
Brand Personality: ${personality || 'Not specified'}
Brand Tone: ${brandTone}
Preferred Vocabulary: ${preferredVocab}
Prohibited Phrases: ${prohibitedPhrases.join(', ') || 'None'}
Required Disclaimers: ${requiredDisclaimers.join(', ') || 'None'}

Grounded Knowledge Base & Evidence:
${groundedFacts || 'No explicit whitepaper evidence available.'}

YOUR TASK:
Craft tailored copy for each requested channel for "${brandName}" (${industry}). Strictly respect the brand tone, incorporate preferred vocabulary where natural, never use prohibited phrases, and attach required disclaimers.`;

    const userPrompt = `Topic Title: ${task.input.topicTitle}
Pillar: ${task.input.contentPillar}
Format: ${task.input.format}
Audience: ${task.input.targetAudience}
CTA: ${cta}
Channels requested: ${task.input.channels.join(', ')}`;

    // Build deterministic mock fallback variants
    const mockVariants: PlatformVariant[] = task.input.channels.map((channel) => {
      if (channel === 'linkedin') {
        return {
          channel: 'linkedin',
          headline: `${task.input.topicTitle}: Insights for ${industry}`,
          hook: `Why ${task.input.targetAudience} are choosing ${brandName} for ${task.input.topicTitle}.`,
          bodyText: `In today's fast-moving ${industry} landscape, staying ahead requires proven strategies and trusted execution.

Key takeaways for ${task.input.targetAudience}:
1. Innovation backed by ${brandName}'s core values
2. Streamlined operations built for scalability and quality
3. Consistent results aligned with ${brandTone.toLowerCase()} standards

Discover how ${brandName} is empowering leaders across ${industry}.`,
          ctaText: `${cta}`,
          hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#${industry.replace(/[^a-zA-Z0-9]/g, '')}`, '#ThoughtLeadership'],
          altText: `Graphic breaking down ${task.input.topicTitle} workflow`,
          visualConcept: `Modern graphic showcasing ${brandName}'s approach to ${task.input.topicTitle}.`,
        };
      } else if (channel === 'facebook') {
        return {
          channel: 'facebook',
          headline: `Join the Discussion: ${task.input.topicTitle}`,
          hook: `Are your social media teams still manually checking every single post for brand compliance?`,
          bodyText: `Discover how modern marketing organizations are using autonomous multi-agent AI to handle research, drafting, and quality verification while keeping humans in full control.

Read our latest whitepaper breakdown and reserve your virtual seat for the live demonstration.`,
          ctaText: `Register Now: ${cta}`,
          hashtags: ['#EnterpriseSaaS', '#Automation', '#DigitalMarketing'],
          altText: 'Facebook event card for ApexAI Multi-Agent Summit',
          visualConcept: 'High contrast event card graphic with date, speaker avatar, and CTA button.',
        };
      } else if (channel === 'instagram') {
        return {
          channel: 'instagram',
          hook: `3 steps to bulletproof brand safety in AI content generation`,
          bodyText: `Swipe through to see how ${brandName}'s Multi-Agent system prevents hallucinations before posts ever hit your feed. 

Step 1: Ingest verified Brand DNA
Step 2: Generate multi-channel variants
Step 3: Run automated compliance review

Link in bio to attend our upcoming live masterclass!`,
          ctaText: 'Link in Bio to Register',
          hashtags: ['#AI', '#BrandSafety', '#EnterpriseTech', '#DesignSystem'],
          altText: `Slide carousel detailing ${task.input.topicTitle}`,
          visualConcept: 'Aesthetic carousel cards with glowing gradient borders and bold typography.',
          carouselSlides: [
            { slideNumber: 1, title: task.input.topicTitle, content: 'The Enterprise AI Blueprint', visualDirection: 'Cover slide with bold title' },
            { slideNumber: 2, title: 'Step 1: Grounded RAG', content: 'Ingest enterprise knowledge documents', visualDirection: 'Document icon and vector graph' },
            { slideNumber: 3, title: 'Step 2: Multi-Agent Review', content: 'Score tone, facts, and disclaimers automatically', visualDirection: 'Shield check mark graphic' },
            { slideNumber: 4, title: 'Take Action', content: cta, visualDirection: 'CTA slide with link bio button' },
          ],
        };
      } else {
        return {
          channel: 'telegram',
          hook: `[ALERT] ${task.input.topicTitle}`,
          bodyText: `Key takeaway for ${task.input.targetAudience}: Multi-agent AI architectures are outperforming single prompts by 300% in corporate compliance testing.

Full presentation & architecture diagram available at the link below.`,
          ctaText: `${cta}: https://t.me/apexai_updates`,
          hashtags: ['#ApexAI', '#Updates'],
          altText: 'Telegram update banner graphic',
        };
      }
    });

    const mockFallback: CopywritingOutput = {
      title: task.input.topicTitle,
      coreIdea: `Platform-tailored content execution for ${task.input.topicTitle} focused on ${task.input.contentPillar}.`,
      contentPillar: task.input.contentPillar,
      format: task.input.format,
      variants: mockVariants,
    };

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: CopywritingOutputSchema,
      mockFallback,
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: res.usedMock ? 0.93 : 0.97,
      warnings: res.usedMock ? ['Variants created via Mock Engine. Add GEMINI_API_KEY for live LLM text generation.'] : [],
      evidence: brandCtx.evidence,
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-copywriting',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const copywritingAgent = new CopywritingAgent();
