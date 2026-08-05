import { describe, it, expect } from 'vitest';
import { contentPlanningAgent } from '../../src/lib/ai/content-planning-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Content Planning Agent', () => {
  it('should generate balanced calendar content plan without collisions', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      campaignId: 'camp_1',
      campaignName: 'AI Launch 2026',
      objective: 'lead_generation',
      channels: ['linkedin' as const, 'facebook' as const],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      pillars: ['Product Innovation', 'Customer Stories'],
      trends: [],
      postCountTarget: 4,
    });

    const res = await contentPlanningAgent.execute(task);
    expect(res.output?.planItems.length).toBe(4);
    expect(res.output?.calendarReady).toBe(true);
  });
});
