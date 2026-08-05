import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';

export const IncidentRecoveryActionSchema = z.enum([
  'retry',
  'reschedule',
  'refresh_credentials',
  'pause_campaign',
  'export_manually',
  'escalate',
]);

export type IncidentRecoveryAction = z.infer<typeof IncidentRecoveryActionSchema>;

export const IncidentInputSchema = z.object({
  incidentId: z.string(),
  brandId: z.string(),
  campaignId: z.string().optional(),
  platform: z.string(),
  errorCategory: z.string(),
  errorMessage: z.string(),
  attemptCount: z.number().default(1),
});

export type IncidentInput = z.input<typeof IncidentInputSchema>;

export const IncidentOutputSchema = z.object({
  incidentId: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  recommendedAction: IncidentRecoveryActionSchema,
  recoveryPlan: z.string(),
  requiresHumanAction: z.boolean(),
});

export type IncidentOutput = z.infer<typeof IncidentOutputSchema>;

export class IncidentAgent {
  public async execute(
    task: AgentTask<IncidentInput>
  ): Promise<AgentResult<IncidentOutput>> {
    const startTime = Date.now();
    const { incidentId, errorCategory, errorMessage, attemptCount } = task.input;

    const lowerMsg = errorMessage.toLowerCase();

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let recommendedAction: IncidentRecoveryAction = 'retry';
    let requiresHumanAction = false;
    let recoveryPlan = '';

    if (errorCategory === 'CREDENTIAL_EXPIRED' || lowerMsg.includes('unauthorized') || lowerMsg.includes('token')) {
      severity = 'HIGH';
      recommendedAction = 'refresh_credentials';
      requiresHumanAction = true;
      recoveryPlan = 'Platform access token expired. Re-authenticate account credentials via Settings Integrations.';
    } else if (errorCategory === 'PERMANENT_POLICY' || lowerMsg.includes('prohibited') || lowerMsg.includes('policy')) {
      severity = 'CRITICAL';
      recommendedAction = 'pause_campaign';
      requiresHumanAction = true;
      recoveryPlan = 'Permanent platform policy block triggered. Pause campaign and route draft to human compliance officer.';
    } else if ((attemptCount || 1) >= 3) {
      severity = 'HIGH';
      recommendedAction = 'export_manually';
      requiresHumanAction = true;
      recoveryPlan = 'Connector retries exhausted. Download manual export package and post directly to platform web console.';
    } else {
      severity = 'LOW';
      recommendedAction = 'retry';
      requiresHumanAction = false;
      recoveryPlan = 'Transient network or rate-limit anomaly detected. Schedule automatic exponential backoff retry.';
    }

    const output: IncidentOutput = {
      incidentId,
      severity,
      recommendedAction,
      recoveryPlan,
      requiresHumanAction,
    };

    return {
      taskId: task.taskId,
      agentName: 'IncidentAgent',
      status: 'completed',
      output,
      confidence: 0.95,
      warnings: [recoveryPlan],
      evidence: [],
      evaluationScores: {
        severityScore: severity === 'CRITICAL' ? 100 : severity === 'HIGH' ? 75 : 50,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'incident-classifier-engine-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const incidentAgent = new IncidentAgent();

// Register in AgentRegistry
agentRegistry.register({
  name: 'IncidentAgent',
  version: '1.0.0',
  description: 'Classifies workflow, connector, credential, and publication incidents and recommends automated or manual recovery actions',
  executionMode: 'deterministic',
  inputSchema: IncidentInputSchema,
  outputSchema: IncidentOutputSchema,
  allowedTools: ['incident_classifier'],
  enabled: true,
  handler: (task) => incidentAgent.execute(task),
});
