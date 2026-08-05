import { durableWorkflowEngine } from '../durable-workflow-engine';

export interface CampaignWorkflowState {
  campaignId: string;
  brandId: string;
  tenantId: string;
  step: 'STRATEGY' | 'CONTENT_GEN' | 'APPROVAL' | 'SCHEDULING' | 'PUBLISHING' | 'COMPLETED' | 'PAUSED';
  campaignData?: any;
}

export async function registerCampaignWorkflow() {
  durableWorkflowEngine.registerWorkflow('campaign-workflow', async (state: CampaignWorkflowState, signalName, signalPayload) => {
    let currentStep = state.step || 'STRATEGY';
    let status: any = 'RUNNING';

    if (signalName === 'PAUSE_CAMPAIGN') {
      currentStep = 'PAUSED';
      status = 'SCHEDULED_TIMER';
      return {
        nextStep: currentStep,
        status,
        state: { ...state, step: currentStep, pauseReason: signalPayload?.reason },
      };
    }

    if (signalName === 'RESUME_CAMPAIGN') {
      currentStep = 'APPROVAL';
      status = 'WAITING_APPROVAL';
      return {
        nextStep: currentStep,
        status,
        state: { ...state, step: currentStep },
      };
    }

    if (currentStep === 'STRATEGY') {
      currentStep = 'CONTENT_GEN';
    } else if (currentStep === 'CONTENT_GEN') {
      currentStep = 'APPROVAL';
      status = 'WAITING_APPROVAL';
    } else if (currentStep === 'APPROVAL' && signalName === 'APPROVAL_DECISION') {
      if (signalPayload?.decision === 'APPROVED') {
        currentStep = 'SCHEDULING';
      } else {
        currentStep = 'CONTENT_GEN';
      }
    } else if (currentStep === 'SCHEDULING') {
      currentStep = 'PUBLISHING';
    } else if (currentStep === 'PUBLISHING') {
      currentStep = 'COMPLETED';
      status = 'COMPLETED';
    }

    return {
      nextStep: currentStep,
      status,
      state: { ...state, step: currentStep },
    };
  });
}
