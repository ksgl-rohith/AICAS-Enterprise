import { describe, it, expect } from 'vitest';
import { durableWorkflowEngine } from '../../src/lib/workflow/durable-workflow-engine';
import { approvalService } from '../../src/lib/approval/approval-service';
import { schedulingAgent } from '../../src/lib/ai/scheduling-agent';
import { publicationLedger } from '../../src/lib/publishing/publication-ledger';
import { analyticsIngestionService } from '../../src/lib/analytics/normalized-analytics';
import { analyticsAgent } from '../../src/lib/ai/analytics-agent';
import { experimentAgent } from '../../src/lib/ai/experiment-agent';
import { optimizationAgent } from '../../src/lib/ai/optimization-agent';
import { learningMemoryService } from '../../src/lib/analytics/learning-memory';
import { autonomyEngine } from '../../src/lib/governance/autonomy-engine';
import { createBaseTask } from '../../src/lib/ai/agent-contract';
import '../../src/lib/workflow/workflows';

describe('Phase 3 Complete Closed-Loop End-to-End Campaign Lifecycle Integration', () => {
  it('should execute full closed-loop lifecycle: Plan -> Create -> Approve -> Schedule -> Publish -> Measure -> Experiment -> Learn -> Recommend -> Improve', async () => {
    const runId = Date.now();
    const tenantId = 'tenant-default';
    const brandId = `brand_e2e_p3_${runId}`;
    const campaignId = `camp_e2e_p3_${runId}`;
    const contentItemId = `item_e2e_p3_${runId}`;

    // 1. PLAN & STRATEGY (Durable Workflow)
    const wfRes = await durableWorkflowEngine.startWorkflow('campaign-workflow', {
      campaignId,
      brandId,
      tenantId,
      step: 'STRATEGY',
    });
    expect(wfRes.status).toBe('RUNNING');

    // 2. REVIEW & HUMAN APPROVAL
    const approvalReq = await approvalService.createApprovalRequest({
      tenantId,
      brandId,
      campaignId,
      contentItemId,
      text: 'Enterprise AI Governance Benchmark Announcement.',
      riskScore: 10,
      factualConfidence: 0.92,
      brandDnaScore: 94,
      oversightMode: 'APPROVAL_REQUIRED',
    });
    expect(approvalReq.status).toBe('PENDING');

    const approvedReq = await approvalService.approve(approvalReq.id, 'admin_reviewer_p3');
    expect(approvedReq?.status).toBe('APPROVED');

    // 3. SCHEDULE
    const schedTask = createBaseTask(tenantId, brandId, {
      campaignId,
      brandId,
      channel: 'linkedin' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const schedRes = await schedulingAgent.execute(schedTask);
    expect(schedRes.output?.isValid).toBe(true);
    const selectedSlot = schedRes.output?.selectedSlot;

    // 4. PUBLISH (Publication Ledger Transaction Entry)
    const ledgerEntry = await publicationLedger.getOrCreateEntry({
      tenantId,
      campaignId,
      contentItemId,
      contentVariantId: `var_p3_${runId}`,
      platform: 'linkedin',
      intendedSchedule: selectedSlot!.proposedTime,
      bodyText: 'Enterprise AI Governance Benchmark Announcement.',
    });
    expect(ledgerEntry.currentState).toBe('PENDING');

    const publishedLedger = await publicationLedger.markPublished(ledgerEntry.publicationId, `ext_p3_${runId}`);
    expect(publishedLedger.currentState).toBe('PUBLISHED');

    // 5. MEASURE (Normalized Metric Event Ingestion)
    const metricIngestRes = await analyticsIngestionService.ingestMetricEvent({
      eventId: `evt_p3_${runId}`,
      tenantId,
      brandId,
      campaignId,
      contentId: contentItemId,
      publicationId: ledgerEntry.publicationId,
      platform: 'linkedin',
      eventType: 'snapshot',
      occurredAt: new Date().toISOString(),
      source: 'api',
      schemaVersion: '1.0',
      metrics: {
        impressions: 15000,
        reach: 12000,
        reactions: 850,
        comments: 110,
        shares: 65,
        saves: 80,
        clicks: 720,
        ctr: 0.048,
        watchTime: 0,
        videoCompletion: 0,
        followerGrowth: 45,
        leads: 18,
        conversions: 6,
        sentiment: 0.92,
        responseTime: 0,
        cpo: 8.5,
      },
    });
    expect(metricIngestRes.isDuplicate).toBe(false);

    // 6. EXPERIMENT (Design and Evaluate Controlled A/B Experiment)
    const expTask = createBaseTask(tenantId, brandId, {
      brandId,
      campaignId,
      hypothesis: 'Technical carousels produce 3x higher CTR than text posts on LinkedIn.',
      primaryMetric: 'ctr',
    });
    const expRes = await experimentAgent.execute(expTask);
    expect(expRes.status).toBe('completed');

    const statEvalRes = experimentAgent.evaluateExperiment(
      'ctr',
      'Control Text',
      { successes: 140, total: 10000 },
      'Treatment Carousel',
      { successes: 480, total: 10000 },
      1000
    );
    expect(statEvalRes.isStatisticallySignificant).toBe(true);
    expect(statEvalRes.recommendedWinner).toBe('Treatment Carousel');

    // 7. LEARN & POLICY MEMORY (Register & Approve Learned Policy)
    const learningItem = await learningMemoryService.createLearningItem({
      tenantId,
      brandId,
      learnedPreference: 'Technical carousel format outperforms text posts on LinkedIn by +242% CTR.',
      supportingEvidence: [statEvalRes.explanation],
      confidence: statEvalRes.confidenceLevel,
      scope: { tenantId, brandId, channel: 'linkedin' },
      status: 'PROPOSED',
    });

    const approvedPolicy = await learningMemoryService.approvePolicy(learningItem.id, 'growth_lead_p3');
    expect(approvedPolicy.status).toBe('APPROVED_LEARNED_POLICY');

    // 8. RECOMMEND & IMPROVE (Optimization Next-Post Recommendation)
    const optTask = createBaseTask(tenantId, brandId, { brandId, campaignId });
    const optRes = await optimizationAgent.execute(optTask);
    expect(optRes.status).toBe('completed');
    expect(optRes.output?.recommendedTopic).toBeDefined();

    // 9. CONTROLLED AUTONOMY EVALUATION
    const autonomyCheck = await autonomyEngine.evaluatePublishingAutonomy({
      tenantId,
      brandId,
      contentItemId,
      oversightMode: 'APPROVAL_REQUIRED',
      riskScore: 10,
      factualConfidence: 0.95,
      brandScore: 94,
      duplicateSimilarity: 0.05,
      contentType: 'text_post',
      connectorStatus: 'CONNECTED',
      availableBudget: true,
    });
    expect(autonomyCheck.requiresHumanApproval).toBe(true);
  });
});
