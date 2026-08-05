import { durableWorkflowEngine } from '../durable-workflow-engine';

export async function registerCrisisPauseWorkflow() {
  durableWorkflowEngine.registerWorkflow('crisis-pause-workflow', async (state: any, signalName, signalPayload) => {
    let step = state.step || 'CRISIS_PAUSE_ACTIVE';
    let status: any = 'SCHEDULED_TIMER';

    if (signalName === 'RESUME_AUTHORIZED') {
      step = 'RESUMED';
      status = 'COMPLETED';
    }

    return {
      nextStep: step,
      status,
      state: { ...state, step, pauseReason: signalPayload?.reason || state.pauseReason },
    };
  });
}
