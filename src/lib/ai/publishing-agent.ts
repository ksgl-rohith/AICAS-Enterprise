import { z } from 'zod';
import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';
import { publicationLedger } from '@/lib/publishing/publication-ledger';
import { publishingRouter } from '@/lib/connectors/publishing-router';
import { eventBus } from '@/lib/events/event-bus';
import { createDomainEvent } from '@/lib/events/domain-events';

export const PublishingInputSchema = z.object({
  contentItemId: z.string(),
  variantId: z.string(),
  channel: z.enum(['linkedin', 'facebook', 'instagram', 'telegram']),
  brandId: z.string(),
  campaignId: z.string(),
  forceSimulated: z.boolean().default(false),
});

export type PublishingInput = z.input<typeof PublishingInputSchema>;

export const PublishingOutputSchema = z.object({
  publicationId: z.string(),
  platformPostId: z.string().optional(),
  permalink: z.string().optional(),
  channel: z.enum(['linkedin', 'facebook', 'instagram', 'telegram']),
  isSimulated: z.boolean(),
  publishedAt: z.string(),
  status: z.enum(['SUCCESS', 'FAILED', 'RETRYING']),
});

export type PublishingOutput = z.infer<typeof PublishingOutputSchema>;

export class PublishingAgent {
  public async execute(
    task: AgentTask<PublishingInput>
  ): Promise<AgentResult<PublishingOutput>> {
    const startTime = Date.now();
    const { contentItemId, variantId, channel, brandId, campaignId, forceSimulated } = task.input;
    const tenantId = task.tenantId || 'tenant-default';

    // 1. Fetch content item & variant - MUST BE APPROVED
    const contentItem = await db.contentItem.findUnique({
      where: { id: contentItemId },
      include: { variants: true },
    });

    if (!contentItem) {
      return {
        taskId: task.taskId,
        agentName: 'PublishingAgent',
        status: 'failed',
        confidence: 0,
        warnings: ['Content item not found'],
        evidence: [],
      };
    }

    if (contentItem.status !== 'APPROVED') {
      return {
        taskId: task.taskId,
        agentName: 'PublishingAgent',
        status: 'blocked',
        confidence: 0,
        warnings: [`Cannot publish content item in '${contentItem.status}' state. Content must be APPROVED by human oversight.`],
        evidence: [],
      };
    }

    const variant = contentItem.variants.find((v) => v.id === variantId) || contentItem.variants[0];

    if (!variant) {
      return {
        taskId: task.taskId,
        agentName: 'PublishingAgent',
        status: 'failed',
        confidence: 0,
        warnings: ['Content variant not found'],
        evidence: [],
      };
    }

    // 2. Ledger Idempotency Entry
    const ledgerEntry = await publicationLedger.getOrCreateEntry({
      tenantId,
      campaignId,
      contentItemId,
      contentVariantId: variant.id,
      platform: channel,
      intendedSchedule: new Date(),
      headline: variant.headline || undefined,
      bodyText: variant.bodyText,
    });

    // Check if already published
    if (ledgerEntry.currentState === 'PUBLISHED') {
      const output: PublishingOutput = {
        publicationId: ledgerEntry.publicationId,
        platformPostId: ledgerEntry.platformPostId || undefined,
        permalink: ledgerEntry.permalink || undefined,
        channel,
        isSimulated: true,
        publishedAt: ledgerEntry.publishedAt ? ledgerEntry.publishedAt.toISOString() : new Date().toISOString(),
        status: 'SUCCESS',
      };
      return {
        taskId: task.taskId,
        agentName: 'PublishingAgent',
        status: 'completed',
        output,
        confidence: 1.0,
        warnings: ['Post was already published previously (idempotent duplicate request prevented).'],
        evidence: [],
      };
    }

    await publicationLedger.markInFlight(ledgerEntry.publicationId);

    // Emit domain event
    await eventBus.publish(
      createDomainEvent('publication.attempted', tenantId, task.correlationId || `corr_${Date.now()}`, 'PublishingAgent', {
        publicationId: ledgerEntry.publicationId,
        channel,
        contentItemId,
      })
    );

    // 3. Execute Connector via Router
    const publishRes = await publishingRouter.publish({
      publicationId: ledgerEntry.publicationId,
      brandId,
      channel,
      headline: variant.headline || undefined,
      hook: variant.hook,
      bodyText: variant.bodyText,
      ctaText: variant.ctaText,
      hashtags: variant.hashtags ? variant.hashtags.split(',') : [],
      altText: variant.altText || undefined,
      idempotencyKey: ledgerEntry.idempotencyKey,
    });

    if (publishRes.success) {
      await publicationLedger.markPublished(
        ledgerEntry.publicationId,
        publishRes.externalPostId || `sim_post_${Date.now()}`,
        publishRes.permalink || `https://${channel}.com/post/${publishRes.externalPostId || '123'}`
      );

      await db.contentItem.update({
        where: { id: contentItemId },
        data: { status: 'PUBLISHED' },
      });

      const output: PublishingOutput = {
        publicationId: ledgerEntry.publicationId,
        platformPostId: publishRes.externalPostId || `sim_post_${Date.now()}`,
        permalink: publishRes.permalink || `https://${channel}.com/post/${publishRes.externalPostId || '123'}`,
        channel,
        isSimulated: publishRes.isSimulated,
        publishedAt: publishRes.publishedAt.toISOString(),
        status: 'SUCCESS',
      };

      await eventBus.publish(
        createDomainEvent('publication.succeeded', tenantId, task.correlationId || `corr_${Date.now()}`, 'PublishingAgent', {
          publicationId: ledgerEntry.publicationId,
          platformPostId: output.platformPostId,
          channel,
        })
      );

      return {
        taskId: task.taskId,
        agentName: 'PublishingAgent',
        status: 'completed',
        output,
        confidence: 1.0,
        warnings: [],
        evidence: [],
        usage: {
          latencyMs: Date.now() - startTime,
        },
        provenance: {
          model: 'connector-sdk-router-v1',
          promptVersion: 'v1.0',
          policyVersion: 'v1.0',
        },
      };
    } else {
      await publicationLedger.markFailed(ledgerEntry.publicationId, publishRes.error || 'Publishing error', true);

      await eventBus.publish(
        createDomainEvent('publication.failed', tenantId, task.correlationId || `corr_${Date.now()}`, 'PublishingAgent', {
          publicationId: ledgerEntry.publicationId,
          error: publishRes.error,
          channel,
        })
      );

      return {
        taskId: task.taskId,
        agentName: 'PublishingAgent',
        status: 'failed',
        confidence: 0,
        warnings: [publishRes.error || 'Failed to publish via connector.'],
        evidence: [],
      };
    }
  }
}

export const publishingAgent = new PublishingAgent();

// Register in AgentRegistry
agentRegistry.register({
  name: 'PublishingAgent',
  version: '1.0.0',
  description: 'Executes idempotent publishing for approved immutable packages via platform connectors and ledger',
  executionMode: 'deterministic',
  inputSchema: PublishingInputSchema,
  outputSchema: PublishingOutputSchema,
  allowedTools: ['connector_router', 'publication_ledger'],
  enabled: true,
  handler: (task) => publishingAgent.execute(task),
});
