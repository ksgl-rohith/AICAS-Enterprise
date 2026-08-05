import { describe, it, expect } from 'vitest';
import { schedulingAgent } from '../../src/lib/ai/scheduling-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Scheduling Agent', () => {
  it('should rank publishing slots within campaign boundaries', async () => {
    const start = new Date(Date.now() + 3600000).toISOString();
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const task = createBaseTask('tenant-1', 'brand-1', {
      campaignId: 'camp_1',
      brandId: 'brand_1',
      channel: 'linkedin' as const,
      startDate: start,
      endDate: end,
    });

    const res = await schedulingAgent.execute(task);
    expect(res.output?.isValid).toBe(true);
    expect(res.output?.recommendedSlots.length).toBeGreaterThan(0);
    expect(res.output?.recommendedSlots[0].isWithinCampaignBounds).toBe(true);
  });
});
