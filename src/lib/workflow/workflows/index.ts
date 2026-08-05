import { registerCampaignWorkflow } from './campaign-workflow';
import { registerContentGenerationWorkflow } from './content-generation-workflow';
import { registerApprovalWorkflow } from './approval-workflow';
import { registerSchedulingWorkflow } from './scheduling-workflow';
import { registerPublishingWorkflow } from './publishing-workflow';
import { registerPublicationRecoveryWorkflow } from './publication-recovery-workflow';
import { registerCrisisPauseWorkflow } from './crisis-pause-workflow';

export function initializeAllWorkflows() {
  registerCampaignWorkflow();
  registerContentGenerationWorkflow();
  registerApprovalWorkflow();
  registerSchedulingWorkflow();
  registerPublishingWorkflow();
  registerPublicationRecoveryWorkflow();
  registerCrisisPauseWorkflow();
}

initializeAllWorkflows();
