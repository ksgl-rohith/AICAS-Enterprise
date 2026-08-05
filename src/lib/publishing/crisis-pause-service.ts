import { db } from '@/lib/db';
import { eventBus } from '@/lib/events/event-bus';
import { createDomainEvent } from '@/lib/events/domain-events';

export class CrisisPauseService {
  private static instance: CrisisPauseService;

  private constructor() {}

  public static getInstance(): CrisisPauseService {
    if (!CrisisPauseService.instance) {
      CrisisPauseService.instance = new CrisisPauseService();
    }
    return CrisisPauseService.instance;
  }

  public async pauseBrand(tenantId: string, brandId: string, reason: string, initiatedBy: string) {
    const pauseLog = await db.crisisPauseLog.create({
      data: {
        tenantId,
        brandId,
        action: 'PAUSED',
        reason,
        initiatedBy,
      },
    });

    // Update all SCHEDULED items for brand campaigns to REPAUSED
    const campaigns = await db.campaign.findMany({
      where: { brandId },
      select: { id: true },
    });

    const campaignIds = campaigns.map((c) => c.id);

    await db.schedule.updateMany({
      where: {
        campaignId: { in: campaignIds },
        status: 'SCHEDULED',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    await eventBus.publish(
      createDomainEvent('campaign.paused', tenantId, `corr_pause_${pauseLog.id}`, 'CrisisPauseService', {
        brandId,
        reason,
        initiatedBy,
      })
    );

    return pauseLog;
  }

  public async resumeBrand(tenantId: string, brandId: string, initiatedBy: string) {
    const resumeLog = await db.crisisPauseLog.create({
      data: {
        tenantId,
        brandId,
        action: 'RESUMED',
        reason: 'Authorized user resume action',
        initiatedBy,
        resumedAt: new Date(),
      },
    });

    await eventBus.publish(
      createDomainEvent('campaign.resumed', tenantId, `corr_resume_${resumeLog.id}`, 'CrisisPauseService', {
        brandId,
        initiatedBy,
      })
    );

    return resumeLog;
  }

  public async isBrandPaused(brandId: string): Promise<boolean> {
    const latest = await db.crisisPauseLog.findFirst({
      where: { brandId },
      orderBy: { pausedAt: 'desc' },
    });
    return latest?.action === 'PAUSED';
  }
}

export const crisisPauseService = CrisisPauseService.getInstance();
