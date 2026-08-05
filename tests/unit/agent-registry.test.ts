import { describe, it, expect } from 'vitest';
import { agentRegistry } from '../../src/lib/ai/agent-registry';
import { createBaseTask } from '../../src/lib/ai/agent-contract';
import '../../src/lib/ai/trend-intelligence-agent';
import '../../src/lib/ai/compliance-agent';

describe('Agent Registry', () => {
  it('should list registered agents', () => {
    const list = agentRegistry.listAgents();
    expect(list.length).toBeGreaterThan(0);
    const agentNames = list.map((a) => a.name);
    expect(agentNames).toContain('TrendIntelligenceAgent');
    expect(agentNames).toContain('ComplianceAgent');
  });

  it('should reject arbitrary untrusted agent execution', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {});
    await expect(agentRegistry.executeAgent('UntrustedArbitraryAgent', task)).rejects.toThrow(
      'Agent \'UntrustedArbitraryAgent\' is not registered'
    );
  });
});
