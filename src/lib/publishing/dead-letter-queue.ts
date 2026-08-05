import { db } from '@/lib/db';
import { eventBus } from '@/lib/events/event-bus';
import { createDomainEvent } from '@/lib/events/domain-events';

export interface EnqueueDLQParams {
  tenantId: string;
  publicationId?: string;
  workflowId?: string;
  platform: string;
  errorCategory: string;
  errorMessage: string;
  payload: any;
}

export class DeadLetterQueue {
  private static instance: DeadLetterQueue;

  private constructor() {}

  public static getInstance(): DeadLetterQueue {
    if (!DeadLetterQueue.instance) {
      DeadLetterQueue.instance = new DeadLetterQueue();
    }
    return DeadLetterQueue.instance;
  }

  public async enqueue(params: EnqueueDLQParams) {
    const dlqItem = await db.deadLetterItem.create({
      data: {
        tenantId: params.tenantId || 'tenant-default',
        publicationId: params.publicationId || null,
        workflowId: params.workflowId || null,
        platform: params.platform,
        errorCategory: params.errorCategory,
        errorMessage: params.errorMessage,
        payloadJson: JSON.stringify(params.payload),
        status: 'OPEN',
      },
    });

    await eventBus.publish(
      createDomainEvent('incident.detected', params.tenantId, `corr_dlq_${dlqItem.id}`, 'DeadLetterQueue', {
        dlqId: dlqItem.id,
        platform: params.platform,
        errorCategory: params.errorCategory,
      })
    );

    return dlqItem;
  }

  public async getOpenItems(tenantId: string) {
    return await db.deadLetterItem.findMany({
      where: {
        tenantId,
        status: 'OPEN',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async resolveManual(dlqId: string, note: string) {
    return await db.deadLetterItem.update({
      where: { id: dlqId },
      data: {
        status: 'RESOLVED_MANUAL',
        resolutionNote: note,
      },
    });
  }

  public async resolveRetry(dlqId: string) {
    return await db.deadLetterItem.update({
      where: { id: dlqId },
      data: {
        status: 'RESOLVED_RETRY',
        retryCount: { increment: 1 },
      },
    });
  }
}

export const deadLetterQueue = DeadLetterQueue.getInstance();
