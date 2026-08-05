import { db } from '@/lib/db';
import { DomainEvent, DomainEventType } from './domain-events';

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventHandler[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T = any>(eventType: DomainEventType | '*', handler: EventHandler<T>): () => void {
    const handlers = this.listeners.get(eventType) || [];
    handlers.push(handler);
    this.listeners.set(eventType, handlers);

    return () => {
      const current = this.listeners.get(eventType) || [];
      this.listeners.set(
        eventType,
        current.filter((h) => h !== handler)
      );
    };
  }

  public async publish<T = any>(event: DomainEvent<T>): Promise<void> {
    // 1. Persist to database audit log
    try {
      await db.domainEventRecord.create({
        data: {
          eventId: event.eventId,
          eventVersion: event.eventVersion,
          eventType: event.eventType,
          tenantId: event.tenantId,
          correlationId: event.correlationId,
          causationId: event.causationId || null,
          producer: event.producer,
          payloadJson: JSON.stringify(event.payload),
          occurredAt: new Date(event.occurredAt),
        },
      });
    } catch (err) {
      console.warn(`[EventBus] Warning: Failed to persist domain event ${event.eventId}:`, err);
    }

    // 2. Dispatch to specific listeners
    const specificHandlers = this.listeners.get(event.eventType) || [];
    const wildcardHandlers = this.listeners.get('*') || [];

    const allHandlers = [...specificHandlers, ...wildcardHandlers];

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (handlerErr) {
        console.error(`[EventBus] Error executing handler for ${event.eventType}:`, handlerErr);
      }
    }
  }
}

export const eventBus = EventBus.getInstance();
