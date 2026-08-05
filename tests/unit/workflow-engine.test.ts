import { describe, it, expect } from 'vitest';
import { durableWorkflowEngine } from '../../src/lib/workflow/durable-workflow-engine';
import '../../src/lib/workflow/workflows';

describe('Durable Workflow Engine', () => {
  it('should start, signal, and recover persisted workflow state', async () => {
    const startRes = await durableWorkflowEngine.startWorkflow('approval-workflow', { itemTitle: 'Test Post' });
    expect(startRes.status).toBe('WAITING_APPROVAL');

    const signalRes = await durableWorkflowEngine.signalWorkflow(startRes.workflowId, 'APPROVE', { reviewer: 'admin' });
    expect(signalRes.status).toBe('COMPLETED');
    expect(signalRes.currentStep).toBe('APPROVED');

    const queryRes = await durableWorkflowEngine.queryWorkflow(startRes.workflowId);
    expect(queryRes?.status).toBe('COMPLETED');
  });
});
