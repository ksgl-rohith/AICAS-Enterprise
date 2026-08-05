import { durableWorkflowEngine } from '../durable-workflow-engine';

export async function registerSchedulingWorkflow() {
  durableWorkflowEngine.registerWorkflow('scheduling-workflow', async (state: any, signalName, signalPayload) => {
    let step = state.step || 'RANK_SLOTS';
    let status: any = 'RUNNING';

    if (step === 'RANK_SLOTS') {
      step = 'TIMER_SCHEDULED';
      status = 'SCHEDULED_TIMER';
    } else if (step === 'TIMER_SCHEDULED' && signalName === 'DISPATCH_DUE') {
      step = 'DISPATCHED';
      status = 'COMPLETED';
    }

    return {
      nextStep: step,
      status,
      state: { ...state, step },
    };
  });
}
