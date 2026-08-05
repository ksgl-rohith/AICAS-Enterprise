import { db } from '@/lib/db';
import { publishingRouter } from '@/lib/connectors/publishing-router';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const now = new Date();
    const dueSchedules = await db.schedule.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledTime: { lte: now },
      },
      include: {
        contentItem: {
          include: {
            campaign: { include: { brand: true } },
            variants: true,
          },
        },
      },
    });

    const results = [];

    for (const schedule of dueSchedules) {
      const contentItem = schedule.contentItem;
      const targetChannel = schedule.channel as any;
      const variant = contentItem.variants.find((v) => v.channel === targetChannel) || contentItem.variants[0];

      if (!variant) continue;

      const idempotencyKey = `idemp_due_${schedule.id}_${Date.now()}`;

      const publishResult = await publishingRouter.publish({
        publicationId: idempotencyKey,
        brandId: contentItem.campaign.brandId,
        channel: targetChannel,
        headline: variant.headline || undefined,
        hook: variant.hook,
        bodyText: variant.bodyText,
        ctaText: variant.ctaText,
        hashtags: variant.hashtags ? variant.hashtags.split(',').map((s) => s.trim()) : [],
        altText: variant.altText || undefined,
        idempotencyKey,
      });

      if (publishResult.success) {
        const publication = await db.publication.create({
          data: {
            contentItemId: contentItem.id,
            scheduleId: schedule.id,
            channel: targetChannel,
            publishingMode: publishResult.isSimulated ? 'simulated' : 'live',
            externalPostId: publishResult.externalPostId || null,
            permalink: publishResult.permalink || null,
            status: 'SUCCESS',
            idempotencyKey,
            publishedAt: publishResult.publishedAt,
          },
        });

        await db.schedule.update({
          where: { id: schedule.id },
          data: { status: 'PUBLISHED' },
        });

        await db.contentItem.update({
          where: { id: contentItem.id },
          data: { status: 'PUBLISHED' },
        });

        results.push({ scheduleId: schedule.id, publicationId: publication.id, status: 'SUCCESS' });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: dueSchedules.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
