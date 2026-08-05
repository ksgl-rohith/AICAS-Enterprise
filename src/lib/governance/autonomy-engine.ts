import { db } from '@/lib/db';

export type AutonomyMode = 'COPILOT' | 'APPROVAL_REQUIRED' | 'RISK_BASED' | 'AUTONOMOUS_CAMPAIGN';

export interface EvaluationInput {
  tenantId: string;
  brandId: string;
  campaignId?: string;
  contentItemId: string;
  oversightMode: AutonomyMode;
  riskScore: number; // 0 - 100
  factualConfidence: number; // 0.0 - 1.0
  brandScore: number; // 0 - 100
  duplicateSimilarity: number; // 0.0 - 1.0
  contentType: string;
  connectorStatus: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'ERROR';
  availableBudget: boolean;
  mandatoryCategory?: string; // e.g. 'FINANCIAL_DISCLAIMER', 'MEDICAL_CLAIM', 'CRISIS_TOPIC'
}

export interface AutonomyEvaluationResult {
  canAutoPublish: boolean;
  modeEvaluated: AutonomyMode;
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
    const isGlobalAutonomousEnabled = process.env.ENABLE_AUTONOMOUS_PUBLISHING === 'true';
    const reasons: string[] = [];

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
      },
    });

    if (openIncidents) {
      reasons.push('Unresolved platform incident blocks automated execution.');
    }

    // Mode-based decisions
    if (input.oversightMode === 'COPILOT' || input.oversightMode === 'APPROVAL_REQUIRED') {
      reasons.push(`Campaign oversight mode '${input.oversightMode}' explicitly requires human approval.`);
      return {
        canAutoPublish: false,
        modeEvaluated: input.oversightMode,
        reasons,
        requiresHumanApproval: true,
      };
    }

    // RISK_BASED or AUTONOMOUS_CAMPAIGN criteria checks
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

    const canAutoPublish = isGlobalAutonomousEnabled && reasons.length === 0;

    return {
      canAutoPublish,
      modeEvaluated: input.oversightMode,
      reasons: reasons.length > 0 ? reasons : ['All 10 controlled autonomy policy checks passed successfully.'],
      requiresHumanApproval: !canAutoPublish,
    };
  }
}

export const autonomyEngine = AutonomyEngine.getInstance();
