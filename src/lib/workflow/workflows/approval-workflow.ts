import { durableWorkflowEngine } from '../durable-workflow-engine';

export async function registerApprovalWorkflow() {
  durableWorkflowEngine.registerWorkflow('approval-workflow', async (state: any, signalName, signalPayload) => {
    let step = state.step || 'QUEUE_PENDING';
    let status: any = 'WAITING_APPROVAL';

    if (signalName === 'APPROVE') {
      step = 'APPROVED';
      status = 'COMPLETED';
    } else if (signalName === 'REJECT') {
      step = 'REJECTED';
      status = 'COMPLETED';
    } else if (signalName === 'REQUEST_REVISION') {
      step = 'REVISION_REQUESTED';
      status = 'COMPLETED';
    } else if (signalName === 'SLA_TIMEOUT') {
      step = 'ESCALATED';
      status = 'WAITING_APPROVAL';
    }

    return {
      nextStep: step,
      status,
      state: { ...state, step, decision: signalPayload },
    };
  });
}
