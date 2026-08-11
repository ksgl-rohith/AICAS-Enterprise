import { describe, it, expect } from 'vitest';
import { durableWorkflowEngine } from '../../src/lib/workflow/durable-workflow-engine';
import { approvalService } from '../../src/lib/approval/approval-service';
import { schedulingAgent } from '../../src/lib/ai/scheduling-agent';
import { publicationLedger } from '../../src/lib/publishing/publication-ledger';
import { createBaseTask } from '../../src/lib/ai/agent-contract';
import '../../src/lib/workflow/workflows';

describe('Phase 2 Pipeline End-to-End Integration', () => {
  it('should execute durable workflow, human approval, scheduling, and publication ledger entry', async () => {
    // 1. Start Campaign Durable Workflow
    const wfRes = await durableWorkflowEngine.startWorkflow('campaign-workflow', {
      campaignId: 'camp_e2e_1',
      brandId: 'brand_e2e_1',
      tenantId: 'tenant-default',
      step: 'STRATEGY',
    });
    expect(wfRes.status).toBe('RUNNING');

    // 2. Evaluate Human Approval Policy
    const approvalReq = await approvalService.createApprovalRequest({
      tenantId: 'tenant-default',
      brandId: 'brand_e2e_1',
      campaignId: 'camp_e2e_1',
      contentItemId: 'item_e2e_1',
      text: 'Standard enterprise marketing content announcement.',
      riskScore: 10,
      factualConfidence: 0.9,
      brandDnaScore: 92,
      oversightMode: 'APPROVAL_REQUIRED',
    });
    expect(approvalReq.status).toBe('PENDING');

    // 3. Approve via Human Oversight
    const approvedReq = await approvalService.approve(approvalReq.id, 'reviewer_admin_1');
    expect(approvedReq?.status).toBe('APPROVED');

    // 4. Rank Scheduling Slots
    const schedTask = createBaseTask('tenant-default', 'brand_e2e_1', {
      campaignId: 'camp_e2e_1',
      brandId: 'brand_e2e_1',
      channel: 'linkedin' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const schedRes = await schedulingAgent.execute(schedTask);
    expect(schedRes.output?.isValid).toBe(true);
    const selectedSlot = schedRes.output?.selectedSlot;
    expect(selectedSlot).toBeDefined();

    // 5. Financial Ledger Transaction Entry
    const runId = Date.now();
    const ledgerEntry = await publicationLedger.getOrCreateEntry({
      tenantId: 'tenant-default',
      campaignId: 'camp_e2e_1',
      contentItemId: 'item_e2e_1',
      contentVariantId: `var_e2e_${runId}`,
      platform: 'linkedin',
      intendedSchedule: selectedSlot!.proposedTime,
      bodyText: 'Standard enterprise marketing content announcement.',
    });

    expect(ledgerEntry.currentState).toBe('PENDING');

    const updatedLedger = await publicationLedger.markPublished(ledgerEntry.publicationId, 'post_ext_9999');
    expect(updatedLedger.currentState).toBe('PUBLISHED');
  });
});
