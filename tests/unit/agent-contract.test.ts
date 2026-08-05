import { describe, it, expect } from 'vitest';
import { createBaseTask, AgentError } from '../../src/lib/ai/agent-contract';

describe('Enterprise Agent Contract', () => {
  it('should create valid base task with tenantId and brandId propagation', () => {
    const task = createBaseTask('tenant-corp-100', 'brand-apex-1', { query: 'test' });
    expect(task.tenantId).toBe('tenant-corp-100');
    expect(task.brandId).toBe('brand-apex-1');
    expect(task.taskId).toBeDefined();
    expect(task.correlationId).toBeDefined();
  });

  it('should correctly initialize AgentError with structured parameters', () => {
    const err = new AgentError({
      code: 'ERR_TEST_CODE',
      message: 'Test failure message',
      agentName: 'TestAgent',
      taskId: 'task_123',
      isRetryable: false,
      tenantId: 'tenant-1',
      brandId: 'brand-1',
    });

    expect(err.code).toBe('ERR_TEST_CODE');
    expect(err.isRetryable).toBe(false);
    expect(err.agentName).toBe('TestAgent');
  });
});
