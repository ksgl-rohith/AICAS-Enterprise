import { z } from 'zod';
import { EvidenceRecord, EvidenceRecordSchema } from './evidence-model';

export interface EvidenceReference {
  documentId?: string;
  chunkId?: string;
  filename?: string;
  sourceText?: string;
  confidence?: number;
}

export const AgentBudgetSchema = z.object({
  maxCostUsd: z.number().optional(),
  maxTokens: z.number().optional(),
  deadlineMs: z.number().optional(),
});

export type AgentBudget = z.infer<typeof AgentBudgetSchema>;

export const ModelPolicySchema = z.object({
  provider: z.enum(['openai', 'gemini', 'mock']).optional(),
  model: z.string().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
});

export type ModelPolicy = z.infer<typeof ModelPolicySchema>;

export interface AgentTask<Input> {
  taskId: string;
  tenantId: string;
  brandId: string;
  campaignId?: string;
  workflowId?: string;
  input: Input;
  contextRefs?: string[];
  policyVersion?: string;
  promptVersion?: string;
  modelPolicy?: ModelPolicy;
  budget?: AgentBudget;
  requestedAt?: string;
  correlationId?: string;
}

export type AgentStatus = 'completed' | 'needs_revision' | 'blocked' | 'failed';

export interface AgentResult<Output> {
  taskId: string;
  agentName?: string;
  status: AgentStatus;
  output?: Output;
  confidence: number;
  warnings: string[];
  evidence: (EvidenceRecord | EvidenceReference)[];
  evaluationScores?: Record<string, number>;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    estimatedTokens?: number;
    estimatedCostUsd?: number;
    latencyMs: number;
  };
  provenance?: {
    model: string;
    modelVersion?: string;
    provider?: string;
    promptVersion: string;
    policyVersion: string;
  };
  startedAt?: string;
  completedAt?: string;
}

export class AgentError extends Error {
  public readonly code: string;
  public readonly agentName: string;
  public readonly taskId: string;
  public readonly isRetryable: boolean;
  public readonly tenantId: string;
  public readonly brandId: string;
  public readonly details?: any;

  constructor(params: {
    code: string;
    message: string;
    agentName: string;
    taskId: string;
    isRetryable?: boolean;
    tenantId: string;
    brandId: string;
    details?: any;
  }) {
    super(params.message);
    this.name = 'AgentError';
    this.code = params.code;
    this.agentName = params.agentName;
    this.taskId = params.taskId;
    this.isRetryable = params.isRetryable ?? false;
    this.tenantId = params.tenantId;
    this.brandId = params.brandId;
    this.details = params.details;
  }
}

export function createBaseTask<Input>(
  tenantId: string,
  brandId: string,
  input: Input,
  overrides?: Partial<AgentTask<Input>>
): AgentTask<Input> {
  return {
    taskId: overrides?.taskId || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenantId: tenantId || 'tenant-default',
    brandId,
    campaignId: overrides?.campaignId,
    workflowId: overrides?.workflowId,
    input,
    contextRefs: overrides?.contextRefs || [],
    policyVersion: overrides?.policyVersion || 'v1.0',
    promptVersion: overrides?.promptVersion || 'v1.0',
    modelPolicy: overrides?.modelPolicy,
    budget: overrides?.budget,
    requestedAt: overrides?.requestedAt || new Date().toISOString(),
    correlationId: overrides?.correlationId || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
}
