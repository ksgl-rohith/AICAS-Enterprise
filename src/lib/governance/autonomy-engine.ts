import { db } from '@/lib/db';

export type AutonomyMode = 'COPILOT' | 'APPROVAL_REQUIRED' | 'RISK_BASED' | 'FULLY_AUTOMATED' | 'AUTONOMOUS' | 'AUTONOMOUS_CAMPAIGN';

export interface EvaluationInput {
  tenantId: string;
  brandId: string;
  campaignId?: string;
  contentItemId: string;
  oversightMode: AutonomyMode | string;
  riskScore: number; // 0 - 100
  factualConfidence: number; // 0.0 - 1.0
  brandScore: number; // 0 - 100
  duplicateSimilarity: number; // 0.0 - 1.0
  contentType: string;
  connectorStatus: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'ERROR';
  availableBudget: boolean;
  mandatoryCategory?: string; // e.g. 'FINANCIAL_DISCLAIMER', 'MEDICAL_CLAIM', 'CRISIS_TOPIC'
  isFeatureFlagEnabled?: boolean;
}

export interface AutonomyEvaluationResult {
  canAutoPublish: boolean;
  modeEvaluated: AutonomyMode | string;
  reasons: string[];
  requiresHumanApproval: boolean;
}

export class AutonomyEngine {
  private static instance: AutonomyEngine;

  private constructor() {}

  public static getInstance(): AutonomyEngine {
    if (!AutonomyEngine.instance) {
      AutonomyEngine.instance = new AutonomyEngine();
    }
    return AutonomyEngine.instance;
  }

  public async evaluatePublishingAutonomy(
    input: EvaluationInput
  ): Promise<AutonomyEvaluationResult> {
    const isGlobalAutonomousEnabled = input.isFeatureFlagEnabled !== undefined
      ? input.isFeatureFlagEnabled
      : (process.env.ENABLE_AUTONOMOUS_PUBLISHING !== 'false');
    const reasons: string[] = [];
    const rawMode = (input.oversightMode || 'APPROVAL_REQUIRED').toUpperCase().replace(/[\s-]+/g, '_');

    // 1. Feature Flag Check
    if (!isGlobalAutonomousEnabled) {
      reasons.push('Autonomous publishing feature flag (ENABLE_AUTONOMOUS_PUBLISHING) is disabled.');
    }

    // 2. Crisis Pause Check
    const activeCrisis = await db.crisisPauseLog.findFirst({
      where: {
        tenantId: input.tenantId,
        brandId: input.brandId,
        resumedAt: null,
      },
    });

    if (activeCrisis) {
      reasons.push(`Brand is under active Crisis Pause initiated by ${activeCrisis.initiatedBy}: ${activeCrisis.reason}.`);
    }

    // 3. Unresolved Incidents Check
    const openIncidents = await db.agentRun.findFirst({
      where: {
        agentName: 'IncidentAgent',
        status: 'blocked',
        OR: [
          { inputSummary: { contains: input.brandId } },
          { outputSummary: { contains: input.brandId } },
          { taskId: { contains: input.brandId } },
          ...(input.campaignId ? [
            { inputSummary: { contains: input.campaignId } },
            { outputSummary: { contains: input.campaignId } },
            { taskId: { contains: input.campaignId } },
          ] : []),
        ],
      },
    });

    if (openIncidents) {
      reasons.push('Unresolved platform incident blocks automated execution.');
    }

    // Mode-based decisions
    if (rawMode === 'COPILOT') {
      reasons.push("Campaign is in Copilot mode: interactive human review and copy approval required.");
      return {
        canAutoPublish: false,
        modeEvaluated: 'COPILOT',
        reasons,
        requiresHumanApproval: true,
      };
    }

    if (rawMode === 'APPROVAL_REQUIRED') {
      reasons.push("Campaign oversight mode 'APPROVAL_REQUIRED' explicitly requires human approval before publishing.");
      return {
        canAutoPublish: false,
        modeEvaluated: 'APPROVAL_REQUIRED',
        reasons,
        requiresHumanApproval: true,
      };
    }

    // RISK_BASED evaluation
    if (rawMode === 'RISK_BASED') {
      if (input.riskScore > 20) {
        reasons.push(`Risk score (${input.riskScore}) exceeds auto-publish threshold (<= 20).`);
      }

      if (input.factualConfidence < 0.85) {
        reasons.push(`Factual confidence (${input.factualConfidence}) is below auto-publish threshold (>= 0.85).`);
      }

      if (input.brandScore < 85) {
        reasons.push(`Brand score (${input.brandScore}) is below auto-publish threshold (>= 85).`);
      }

      if (input.duplicateSimilarity > 0.30) {
        reasons.push(`Duplicate similarity (${input.duplicateSimilarity}) exceeds auto-publish threshold (<= 0.30).`);
      }

      if (input.connectorStatus !== 'CONNECTED') {
        reasons.push(`Platform connector status is '${input.connectorStatus}' (must be CONNECTED).`);
      }

      if (!input.availableBudget) {
        reasons.push('Tenant budget exhausted.');
      }

      if (input.mandatoryCategory) {
        reasons.push(`Content matches mandatory human review category '${input.mandatoryCategory}'.`);
      }
    } else {
      // FULLY_AUTOMATED / AUTONOMOUS / AUTONOMOUS_CAMPAIGN evaluation
      if (input.riskScore > 50) {
        reasons.push(`Critical risk threshold exceeded (${input.riskScore} > 50).`);
      }

      if (input.connectorStatus !== 'CONNECTED') {
        reasons.push(`Platform connector status is '${input.connectorStatus}' (must be CONNECTED).`);
      }

      if (!input.availableBudget) {
        reasons.push('Tenant budget exhausted.');
      }

      if (input.mandatoryCategory) {
        reasons.push(`Content matches mandatory human review category '${input.mandatoryCategory}'.`);
      }
    }

    const canAutoPublish = isGlobalAutonomousEnabled && reasons.length === 0;

    return {
      canAutoPublish,
      modeEvaluated: rawMode,
      reasons: reasons.length > 0 ? reasons : ['All controlled autonomy policy checks passed successfully.'],
      requiresHumanApproval: !canAutoPublish,
    };
  }
}

export const autonomyEngine = AutonomyEngine.getInstance();
