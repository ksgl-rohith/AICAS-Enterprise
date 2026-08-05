import { durableWorkflowEngine } from '../durable-workflow-engine';

export async function registerContentGenerationWorkflow() {
  durableWorkflowEngine.registerWorkflow('content-generation-workflow', async (state: any, signalName, signalPayload) => {
    let step = state.step || 'GENERATE_VARIANTS';
    let status: any = 'RUNNING';

    if (step === 'GENERATE_VARIANTS') {
      step = 'QUALITY_COUNCIL_REVIEW';
    } else if (step === 'QUALITY_COUNCIL_REVIEW') {
      if (signalName === 'REVISION_NEEDED') {
        step = 'REVISE_DRAFT';
      } else {
        step = 'GENERATION_COMPLETE';
        status = 'COMPLETED';
      }
    } else if (step === 'REVISE_DRAFT') {
      step = 'QUALITY_COUNCIL_REVIEW';
    }

    return {
      nextStep: step,
      status,
      state: { ...state, step },
    };
  });
}
