import { db } from '@/lib/db';
import {
  WorkflowAdapter,
  WorkflowExecutionResult,
  WorkflowOptions,
  WorkflowStatus,
} from './workflow-adapter';

export type WorkflowHandlerFunction = (
  state: any,
  signalName?: string,
  signalPayload?: any
) => Promise<{
  nextStep: string;
  status: WorkflowStatus;
  state: any;
  errorDetails?: string;
}>;

export class DurableWorkflowEngine implements WorkflowAdapter {
  private static instance: DurableWorkflowEngine;
  private workflowHandlers: Map<string, WorkflowHandlerFunction> = new Map();

  private constructor() {}

  public static getInstance(): DurableWorkflowEngine {
    if (!DurableWorkflowEngine.instance) {
      DurableWorkflowEngine.instance = new DurableWorkflowEngine();
    }
    return DurableWorkflowEngine.instance;
  }

  public registerWorkflow(name: string, handler: WorkflowHandlerFunction): void {
    this.workflowHandlers.set(name, handler);
  }

  public async startWorkflow<Input = any, State = any>(
    workflowName: string,
    input: Input,
    options?: WorkflowOptions
  ): Promise<WorkflowExecutionResult<State>> {
    const workflowId =
      options?.workflowId || `wf_${workflowName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tenantId = options?.tenantId || 'tenant-default';
    const brandId = options?.brandId || null;
    const campaignId = options?.campaignId || null;

    const initialHistory = [{ step: 'INITIATED', timestamp: new Date().toISOString(), note: 'Workflow created' }];

    const instance = await db.workflowInstance.create({
      data: {
        workflowId,
        workflowName,
        tenantId,
        brandId,
        campaignId,
        status: 'RUNNING',
        currentStep: 'INITIATED',
        inputJson: JSON.stringify(input),
        stateJson: JSON.stringify(input),
        historyJson: JSON.stringify(initialHistory),
        version: 1,
      },
    });

    const handler = this.workflowHandlers.get(workflowName);
    if (handler) {
      try {
        const stepRes = await handler(input);
        const updatedHistory = [
          ...initialHistory,
          { step: stepRes.nextStep, timestamp: new Date().toISOString() },
        ];

        const updated = await db.workflowInstance.update({
          where: { id: instance.id },
          data: {
            status: stepRes.status,
            currentStep: stepRes.nextStep,
            stateJson: JSON.stringify(stepRes.state),
            historyJson: JSON.stringify(updatedHistory),
            errorDetails: stepRes.errorDetails || null,
          },
        });

        return this.mapToResult<State>(updated);
      } catch (err: any) {
        const updated = await db.workflowInstance.update({
          where: { id: instance.id },
          data: {
            status: 'FAILED',
            errorDetails: err.message || 'Workflow execution error',
          },
        });
        return this.mapToResult<State>(updated);
      }
    }

    return this.mapToResult<State>(instance);
  }

  public async signalWorkflow<SignalPayload = any, State = any>(
    workflowId: string,
    signalName: string,
    payload: SignalPayload
  ): Promise<WorkflowExecutionResult<State>> {
    const instance = await db.workflowInstance.findUnique({
      where: { workflowId },
    });

    if (!instance) {
      throw new Error(`Workflow instance '${workflowId}' not found.`);
    }

    const currentState = JSON.parse(instance.stateJson);
    const history = instance.historyJson ? JSON.parse(instance.historyJson) : [];
    history.push({
      step: `SIGNAL_${signalName}`,
      timestamp: new Date().toISOString(),
      note: `Received signal ${signalName}`,
    });

    const handler = this.workflowHandlers.get(instance.workflowName);
    if (!handler) {
      throw new Error(`No handler registered for workflow '${instance.workflowName}'.`);
    }

    const stepRes = await handler(currentState, signalName, payload);
    history.push({ step: stepRes.nextStep, timestamp: new Date().toISOString() });

    const updated = await db.workflowInstance.update({
      where: { workflowId },
      data: {
        status: stepRes.status,
        currentStep: stepRes.nextStep,
        stateJson: JSON.stringify(stepRes.state),
        historyJson: JSON.stringify(history),
        version: { increment: 1 },
        errorDetails: stepRes.errorDetails || null,
      },
    });

    return this.mapToResult<State>(updated);
  }

  public async queryWorkflow<State = any>(
    workflowId: string
  ): Promise<WorkflowExecutionResult<State> | null> {
    const instance = await db.workflowInstance.findUnique({
      where: { workflowId },
    });
    if (!instance) return null;
    return this.mapToResult<State>(instance);
  }

  public async cancelWorkflow(
    workflowId: string,
    reason?: string
  ): Promise<WorkflowExecutionResult | null> {
    const instance = await db.workflowInstance.findUnique({
      where: { workflowId },
    });
    if (!instance) return null;

    const history = instance.historyJson ? JSON.parse(instance.historyJson) : [];
    history.push({
      step: 'CANCELLED',
      timestamp: new Date().toISOString(),
      note: reason || 'Workflow cancelled by user',
    });

    const updated = await db.workflowInstance.update({
      where: { workflowId },
      data: {
        status: 'CANCELLED',
        currentStep: 'CANCELLED',
        historyJson: JSON.stringify(history),
        errorDetails: reason || 'Cancelled',
      },
    });

    return this.mapToResult(updated);
  }

  public async retryWorkflow(workflowId: string): Promise<WorkflowExecutionResult | null> {
    const instance = await db.workflowInstance.findUnique({
      where: { workflowId },
    });
    if (!instance) return null;

    const state = JSON.parse(instance.stateJson);
    const handler = this.workflowHandlers.get(instance.workflowName);
    if (!handler) return null;

    const stepRes = await handler(state, 'RETRY', {});
    const history = instance.historyJson ? JSON.parse(instance.historyJson) : [];
    history.push({ step: `RETRY_${stepRes.nextStep}`, timestamp: new Date().toISOString() });

    const updated = await db.workflowInstance.update({
      where: { workflowId },
      data: {
        status: stepRes.status,
        currentStep: stepRes.nextStep,
        stateJson: JSON.stringify(stepRes.state),
        historyJson: JSON.stringify(history),
        errorDetails: null,
      },
    });

    return this.mapToResult(updated);
  }

  private mapToResult<State>(dbRecord: any): WorkflowExecutionResult<State> {
    return {
      workflowId: dbRecord.workflowId,
      workflowName: dbRecord.workflowName,
      status: dbRecord.status as WorkflowStatus,
      currentStep: dbRecord.currentStep,
      state: dbRecord.stateJson ? JSON.parse(dbRecord.stateJson) : {},
      history: dbRecord.historyJson ? JSON.parse(dbRecord.historyJson) : [],
      errorDetails: dbRecord.errorDetails || undefined,
    };
  }
}

export const durableWorkflowEngine = DurableWorkflowEngine.getInstance();
