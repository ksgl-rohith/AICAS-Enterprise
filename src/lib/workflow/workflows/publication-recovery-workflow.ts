import { durableWorkflowEngine } from '../durable-workflow-engine';

export async function registerPublicationRecoveryWorkflow() {
  durableWorkflowEngine.registerWorkflow('publication-recovery-workflow', async (state: any, signalName, signalPayload) => {
    let step = state.step || 'RECONCILE_AMBIGUOUS_STATE';
    let status: any = 'RUNNING';

    if (step === 'RECONCILE_AMBIGUOUS_STATE') {
      if (signalName === 'CREDENTIAL_REFRESH_NEEDED') {
        step = 'REFRESH_TOKENS';
      } else {
        step = 'RECONCILIATION_DONE';
        status = 'COMPLETED';
      }
    } else if (step === 'REFRESH_TOKENS') {
      step = 'RETRY_PUBLICATION';
      status = 'COMPLETED';
    }

    return {
      nextStep: step,
      status,
      state: { ...state, step },
    };
  });
}
