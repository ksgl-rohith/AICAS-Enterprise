import { describe, it, expect } from 'vitest';
import { incidentAgent } from '../../src/lib/ai/incident-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Incident Agent', () => {
  it('should recommend credential refresh for unauthorized errors', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      incidentId: 'inc_1',
      brandId: 'brand-1',
      platform: 'linkedin',
      errorCategory: 'CREDENTIAL_EXPIRED',
      errorMessage: 'Access token expired or revoked by platform.',
    });

    const res = await incidentAgent.execute(task);
    expect(res.output?.recommendedAction).toBe('refresh_credentials');
    expect(res.output?.requiresHumanAction).toBe(true);
  });
});
