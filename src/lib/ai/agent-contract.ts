export interface EvidenceReference {
  documentId?: string;
  chunkId?: string;
  filename?: string;
  sourceText?: string;
  confidence?: number;
}

export interface AgentTask<Input> {
  taskId: string;
  brandId: string;
  campaignId?: string;
  input: Input;
  contextRefs?: string[];
  policyVersion?: string;
  promptVersion?: string;
}

export interface AgentResult<Output> {
  taskId: string;
  status: 'completed' | 'needs_revision' | 'blocked' | 'failed';
  output?: Output;
  confidence: number;
  warnings: string[];
  evidence: EvidenceReference[];
  usage?: {
    latencyMs: number;
    estimatedTokens?: number;
  };
  provenance?: {
    model: string;
    promptVersion: string;
    policyVersion: string;
  };
}
