import { z } from 'zod';

export const DomainEventTypeSchema = z.enum([
  'content.approval.requested',
  'content.approved',
  'content.rejected',
  'content.revision.requested',
  'content.scheduled',
  'publication.requested',
  'publication.attempted',
  'publication.succeeded',
  'publication.failed',
  'publication.reconciliation.required',
  'connector.credential.expiring',
  'incident.detected',
  'campaign.paused',
  'campaign.resumed',
]);

export type DomainEventType = z.infer<typeof DomainEventTypeSchema>;

export interface DomainEvent<Payload = any> {
  eventId: string;
  eventVersion: string; // e.g. 'v1.0'
  eventType: DomainEventType;
  tenantId: string;
  correlationId: string;
  causationId?: string;
  producer: string;
  occurredAt: string;
  payload: Payload;
}

export function createDomainEvent<Payload>(
  eventType: DomainEventType,
  tenantId: string,
  correlationId: string,
  producer: string,
  payload: Payload,
  causationId?: string
): DomainEvent<Payload> {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventVersion: 'v1.0',
    eventType,
    tenantId: tenantId || 'tenant-default',
    correlationId: correlationId || `corr_${Date.now()}`,
    causationId,
    producer,
    occurredAt: new Date().toISOString(),
    payload,
  };
}
