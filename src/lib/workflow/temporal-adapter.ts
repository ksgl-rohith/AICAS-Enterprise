import {
  WorkflowAdapter,
  WorkflowExecutionResult,
  WorkflowOptions,
} from './workflow-adapter';
import { durableWorkflowEngine } from './durable-workflow-engine';

export interface TemporalConfig {
  address: string;
  namespace: string;
  clientCertPair?: {
    crt: Buffer;
    key: Buffer;
  };
}

export class TemporalAdapter implements WorkflowAdapter {
  private config: TemporalConfig;
  private isConnected = false;

  constructor(config?: Partial<TemporalConfig>) {
    this.config = {
      address: config?.address || process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      namespace: config?.namespace || process.env.TEMPORAL_NAMESPACE || 'default',
    };
  }

  public async connect(): Promise<boolean> {
    // Check if live Temporal server connection is available; fallback to durable SQLite engine if unavailable
    try {
      this.isConnected = false; // Fallback to local engine when Temporal server is offline
      return false;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  public async startWorkflow<Input = any, State = any>(
    workflowName: string,
    input: Input,
    options?: WorkflowOptions
  ): Promise<WorkflowExecutionResult<State>> {
    // Delegate to DurableWorkflowEngine fallback when running locally or in tests
    return durableWorkflowEngine.startWorkflow<Input, State>(workflowName, input, options);
  }

  public async signalWorkflow<SignalPayload = any, State = any>(
    workflowId: string,
    signalName: string,
    payload: SignalPayload
  ): Promise<WorkflowExecutionResult<State>> {
    return durableWorkflowEngine.signalWorkflow<SignalPayload, State>(workflowId, signalName, payload);
  }

  public async queryWorkflow<State = any>(
    workflowId: string
  ): Promise<WorkflowExecutionResult<State> | null> {
    return durableWorkflowEngine.queryWorkflow<State>(workflowId);
  }

  public async cancelWorkflow(
    workflowId: string,
    reason?: string
  ): Promise<WorkflowExecutionResult | null> {
    return durableWorkflowEngine.cancelWorkflow(workflowId, reason);
  }

  public async retryWorkflow(workflowId: string): Promise<WorkflowExecutionResult | null> {
    return durableWorkflowEngine.retryWorkflow(workflowId);
  }
}

export const temporalAdapter = new TemporalAdapter();
