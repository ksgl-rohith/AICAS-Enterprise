import { db } from '@/lib/db';
import { copywritingAgent } from '@/lib/ai/copywriting-agent';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        strategy: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!campaign.strategy) {
      return NextResponse.json({ error: 'Please generate a campaign strategy first.' }, { status: 400 });
    }

    const pillars = JSON.parse(campaign.strategy.contentPillarsJson || '[]');
    const ideas = JSON.parse(campaign.strategy.contentIdeasJson || '[]');
    const channels = campaign.channels.split(',').map((c) => c.trim().toLowerCase()) as ('linkedin' | 'facebook' | 'instagram' | 'telegram')[];

    const topicsToGenerate = ideas.length > 0 ? ideas.slice(0, 3) : [
      `Why single LLM prompts fail enterprise brand standards in ${campaign.productOrTopic}`,
      `How Multi-Agent Systems eliminate AI hallucinations in corporate social media`,
      `4x Content Output Velocity with Deterministic Review Gates`,
    ];

    const createdContentItems = [];

    for (let i = 0; i < topicsToGenerate.length; i++) {
      const topic = topicsToGenerate[i];
      const pillar = pillars[i % Math.max(1, pillars.length)]?.name || 'Enterprise Strategy';
      const format = i === 2 ? 'carousel' : i === 1 ? 'image_post' : 'text_post';

      const taskId = `task_copy_${campaign.id}_${i}_${Date.now()}`;

      const agentRes = await copywritingAgent.execute({
        taskId,
        brandId: campaign.brandId,
        campaignId: campaign.id,
        input: {
          brandId: campaign.brandId,
          campaignId: campaign.id,
          topicTitle: topic,
          contentPillar: pillar,
          targetAudience: campaign.targetAudience,
          format,
          defaultCTA: campaign.offerCTA,
          channels,
        },
      });

      if (agentRes.output) {
        const out = agentRes.output;

        // Create ContentItem
        const item = await db.contentItem.create({
          data: {
            campaignId: campaign.id,
            title: out.title,
            coreIdea: out.coreIdea,
            targetAudience: campaign.targetAudience,
            contentPillar: out.contentPillar,
            format: out.format,
            defaultCTA: campaign.offerCTA,
            status: 'DRAFT',
          },
        });

        // Create ContentVariants for each channel
        for (const variant of out.variants) {
          await db.contentVariant.create({
            data: {
              contentItemId: item.id,
              channel: variant.channel,
              headline: variant.headline,
              hook: variant.hook,
              bodyText: variant.bodyText,
              ctaText: variant.ctaText,
              hashtags: (variant.hashtags || []).join(', '),
              altText: variant.altText,
              visualConcept: variant.visualConcept,
              carouselSlidesJson: variant.carouselSlides ? JSON.stringify(variant.carouselSlides) : null,
              status: 'GENERATED',
            },
          });
        }

        createdContentItems.push(item);

        // Log Agent Run
        await db.agentRun.create({
          data: {
            taskId,
            agentName: 'CopywritingAgent',
            status: agentRes.status,
            inputSummary: `Topic: ${topic}`,
            outputSummary: `Generated ${out.variants.length} channel variants.`,
            confidence: agentRes.confidence,
            warningsJson: JSON.stringify(agentRes.warnings),
            latencyMs: agentRes.usage?.latencyMs || 0,
            modelName: agentRes.provenance?.model || 'gemini-2.5-flash',
          },
        });
      }
    }

    // Update campaign status
    await db.campaign.update({
      where: { id: campaign.id },
      data: { status: 'CONTENT_GENERATED' },
    });

    // Log Audit Event
    await db.auditEvent.create({
      data: {
        userId: campaign.brand.userId,
        brandId: campaign.brandId,
        campaignId: campaign.id,
        action: 'CONTENT_GENERATED',
        details: `CopywritingAgent generated ${createdContentItems.length} content items with multi-channel variants.`,
        entityType: 'ContentItem',
        entityId: createdContentItems[0]?.id || campaign.id,
      },
    });

    return NextResponse.json({
      success: true,
      count: createdContentItems.length,
      items: createdContentItems,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
