import { db } from '@/lib/db';
import { createHash } from 'crypto';

export type LedgerState =
  | 'PENDING'
  | 'IN_FLIGHT'
  | 'PUBLISHED'
  | 'FAILED_TRANSIENT'
  | 'FAILED_PERMANENT'
  | 'RECONCILING';

export interface LedgerEntryParams {
  publicationId?: string;
  tenantId: string;
  campaignId: string;
  contentItemId: string;
  contentVariantId: string;
  platform: 'linkedin' | 'facebook' | 'instagram' | 'telegram';
  connectorAccountId?: string;
  intendedSchedule: Date | string;
  headline?: string;
  bodyText: string;
}

export class PublicationLedger {
  private static instance: PublicationLedger;

  private constructor() {}

  public static getInstance(): PublicationLedger {
    if (!PublicationLedger.instance) {
      PublicationLedger.instance = new PublicationLedger();
    }
    return PublicationLedger.instance;
  }

  public generateIdempotencyKey(params: LedgerEntryParams): string {
    const raw = `${params.tenantId}:${params.campaignId}:${params.contentVariantId}:${params.platform}`;
    return `idemp_${createHash('sha256').update(raw).digest('hex').slice(0, 24)}`;
  }

  public generateChecksum(params: LedgerEntryParams): string {
    const raw = `${params.headline || ''}:${params.bodyText}:${params.platform}`;
    return createHash('md5').update(raw).digest('hex');
  }

  public async getOrCreateEntry(params: LedgerEntryParams) {
    const idempotencyKey = this.generateIdempotencyKey(params);
    const checksum = this.generateChecksum(params);
    const publicationId = params.publicationId || `pub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const existing = await db.publicationLedgerEntry.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      return existing;
    }

    return await db.publicationLedgerEntry.create({
      data: {
        publicationId,
        tenantId: params.tenantId,
        campaignId: params.campaignId,
        contentItemId: params.contentItemId,
        contentVariantId: params.contentVariantId,
        platform: params.platform,
        connectorAccountId: params.connectorAccountId || null,
        idempotencyKey,
        requestChecksum: checksum,
        intendedSchedule: new Date(params.intendedSchedule),
        currentState: 'PENDING',
        attemptCount: 0,
      },
    });
  }

  public async markInFlight(publicationId: string) {
    return await db.publicationLedgerEntry.update({
      where: { publicationId },
      data: {
        currentState: 'IN_FLIGHT',
        attemptCount: { increment: 1 },
      },
    });
  }

  public async markPublished(publicationId: string, platformPostId: string, permalink?: string) {
    return await db.publicationLedgerEntry.update({
      where: { publicationId },
      data: {
        currentState: 'PUBLISHED',
        platformPostId,
        permalink: permalink || null,
        publishedAt: new Date(),
        reconciliationStatus: 'OK',
      },
    });
  }

  public async markFailed(publicationId: string, errorDetails: string, isTransient: boolean) {
    return await db.publicationLedgerEntry.update({
      where: { publicationId },
      data: {
        currentState: isTransient ? 'FAILED_TRANSIENT' : 'FAILED_PERMANENT',
        lastErrorDetails: errorDetails,
        reconciliationStatus: isTransient ? 'NEEDS_RECONCILIATION' : 'OK',
      },
    });
  }
}

export const publicationLedger = PublicationLedger.getInstance();
