import { durableWorkflowEngine } from '../durable-workflow-engine';

export async function registerPublishingWorkflow() {
  durableWorkflowEngine.registerWorkflow('publishing-workflow', async (state: any, signalName, signalPayload) => {
    let step = state.step || 'LEDGER_CHECK';
    let status: any = 'RUNNING';

    if (step === 'LEDGER_CHECK') {
      step = 'CONNECTOR_PUBLISH';
    } else if (step === 'CONNECTOR_PUBLISH') {
      if (signalName === 'PUBLISH_SUCCESS') {
        step = 'PUBLISHED';
        status = 'COMPLETED';
      } else if (signalName === 'PUBLISH_TRANSIENT_FAIL') {
        step = 'RETRY_BACKOFF';
        status = 'RUNNING';
      } else {
        step = 'FAILED_PERMANENT';
        status = 'FAILED';
      }
    } else if (step === 'RETRY_BACKOFF') {
      step = 'CONNECTOR_PUBLISH';
    }

    return {
      nextStep: step,
      status,
      state: { ...state, step },
    };
  });
}
