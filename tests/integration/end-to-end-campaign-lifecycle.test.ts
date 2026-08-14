import { describe, it, expect, beforeEach, vi } from 'vitest';
import { campaignLifecycleOrchestrator } from '@/lib/workflow/campaign-lifecycle-orchestrator';
import { db } from '@/lib/db';
import { forecastingAgent } from '@/lib/ai/forecasting-agent';

describe('End-to-End Campaign Lifecycle Acceptance Test', () => {
  let brandId: string;
  let campaignId: string;

  beforeEach(async () => {
    vi.restoreAllMocks();
    process.env.ENABLE_AUTONOMOUS_PUBLISHING = 'true';

    const user = await db.user.findFirst();
    const brand = await db.brand.create({
      data: {
        userId: user?.id || 'u_default',
        name: 'Apex Legal Advisory',
        industry: 'Legal Services & Law Firm',
        description: 'Premier corporate legal advisory and litigation firm.',
        products: 'Corporate Advisory, Commercial Contracts, Litigation',
        targetAudience: 'Corporations, Enterprise Founders, Investors',
        personality: 'Authoritative, Precise',
        tone: 'Professional',
        preferredVocabulary: 'Legal Counsel, Corporate Advisory, Due Diligence',
        prohibitedPhrases: 'cheap legal hack, guaranteed court win',
        requiredDisclaimers: 'Legal Disclaimer: Attorney-client consultation required.',
        defaultCTA: 'Schedule a Legal Consultation',
      },
    });

    brandId = brand.id;

    const campaign = await db.campaign.create({
      data: {
        brandId,
        name: 'Q3 Enterprise Legal Growth',
        objective: 'qualified_leads',
        productOrTopic: 'Corporate Advisory Services',
        description: 'Targeting enterprise legal officers and business leaders',
        targetAudience: 'Corporate Counsel, VPs of Operations',
        offerCTA: 'Schedule a Legal Consultation',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400 * 1000),
        channels: 'linkedin,facebook',
        status: 'PLANNING',
        oversightMode: 'AUTONOMOUS',
      },
    });

    campaignId = campaign.id;

    await db.campaignStrategy.create({
      data: {
        campaignId,
        version: 1,
        status: 'DRAFT',
        objectiveInterpretation: 'Drive qualified enterprise legal consultation leads.',
        audienceSummary: 'Enterprise corporate counsel and operations executives.',
        campaignNarrative: 'Establishing Apex Legal Advisory as the premier partner for complex corporate litigation and regulatory compliance.',
        contentPillarsJson: JSON.stringify([
          { name: 'Corporate Compliance Excellence', angle: 'Navigating regulatory changes in 2026', rationale: 'Builds authority' },
          { name: 'Dispute Resolution & Risk Mitigation', angle: 'Mitigating commercial litigation risk', rationale: 'Drives consultation leads' },
        ]),
        channelRolesJson: JSON.stringify({ linkedin: 'Executive thought leadership', facebook: 'Client education' }),
        publishingCadence: 'Strategic twice-weekly schedule',
        contentIdeasJson: JSON.stringify([
          'Navigating Enterprise Regulatory Compliance in 2026',
          '3 Crucial Clauses Every Commercial Contract Must Contain',
        ]),
        constraintsJson: JSON.stringify(['Must include disclaimer']),
      },
    });
  });

  it('executes complete end-to-end lifecycle: Strategy Approval -> Content Generation -> Quality Review -> Schedule Persistence -> Forecast', async () => {
    // 1. Approve Strategy via Orchestrator
    const result = await campaignLifecycleOrchestrator.approveStrategy(campaignId);

    expect(result.success).toBe(true);
    expect(result.campaign.status).toBe('SCHEDULED');
    expect(result.contentCount).toBeGreaterThan(0);

    // 2. Verify persisted ContentItem and Schedule records in DB
    const contentItems = await db.contentItem.findMany({
      where: { campaignId },
      include: { variants: true, schedules: true },
    });

    expect(contentItems.length).toBeGreaterThan(0);
    expect(contentItems[0].status).toBe('APPROVED');
    expect(contentItems[0].variants.length).toBeGreaterThan(0);

    const schedules = await db.schedule.findMany({ where: { campaignId } });
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0].status).toBe('SCHEDULED');

    // 3. Verify Forecasting Agent range predictions
    const forecast = await forecastingAgent.predictPerformance({
      brandId,
      campaignId,
      channel: 'linkedin',
      format: 'carousel',
      cta: 'Schedule a Legal Consultation',
    });

    expect(forecast.predictedValue).toBeGreaterThan(0);
    expect(forecast.lowerBound).toBeLessThan(forecast.predictedValue);
    expect(forecast.upperBound).toBeGreaterThan(forecast.predictedValue);

    // 4. Verify Lifecycle Audit Log Records
    const auditEvents = await db.auditEvent.findMany({
      where: { campaignId },
    });

    expect(auditEvents.length).toBeGreaterThan(0);
    expect(auditEvents.some((e) => e.action.includes('transition'))).toBe(true);
  });
});
