import { z } from 'zod';

export type WorkflowStatus =
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'SCHEDULED_TIMER'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface WorkflowOptions {
  workflowId?: string;
  tenantId?: string;
  brandId?: string;
  campaignId?: string;
  retryPolicy?: {
    maxAttempts?: number;
    initialIntervalMs?: number;
    backoffCoefficient?: number;
  };
}

export interface WorkflowExecutionResult<State = any> {
  workflowId: string;
  workflowName: string;
  status: WorkflowStatus;
  currentStep: string;
  state: State;
  history: Array<{ step: string; timestamp: string; note?: string }>;
  errorDetails?: string;
}

export interface WorkflowAdapter {
  startWorkflow<Input = any, State = any>(
    workflowName: string,
    input: Input,
    options?: WorkflowOptions
  ): Promise<WorkflowExecutionResult<State>>;

  signalWorkflow<SignalPayload = any, State = any>(
    workflowId: string,
    signalName: string,
    payload: SignalPayload
  ): Promise<WorkflowExecutionResult<State>>;

  queryWorkflow<State = any>(workflowId: string): Promise<WorkflowExecutionResult<State> | null>;

  cancelWorkflow(workflowId: string, reason?: string): Promise<WorkflowExecutionResult | null>;

  retryWorkflow(workflowId: string): Promise<WorkflowExecutionResult | null>;
}
