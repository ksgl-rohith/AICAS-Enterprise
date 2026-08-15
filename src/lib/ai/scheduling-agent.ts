import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';

export const ScheduledSlotSchema = z.object({
  slotId: z.string(),
  channel: z.string(),
  proposedTime: z.string(),
  rank: z.number(),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  isWithinCampaignBounds: z.boolean(),
  isBlackoutCollision: z.boolean(),
});

export type ScheduledSlot = z.infer<typeof ScheduledSlotSchema>;

export const SchedulingInputSchema = z.object({
  campaignId: z.string(),
  brandId: z.string(),
  channel: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string().default('UTC'),
  contentCategory: z.enum(['evergreen', 'time_sensitive', 'campaign', 'reactive']).default('campaign'),
  blackoutWindows: z.array(z.string()).default([]),
  existingSchedules: z.array(z.string()).default([]),
});

export type SchedulingInput = z.input<typeof SchedulingInputSchema>;

export const SchedulingOutputSchema = z.object({
  contentItemId: z.string().optional(),
  channel: z.string(),
  recommendedSlots: z.array(ScheduledSlotSchema),
  selectedSlot: ScheduledSlotSchema.optional(),
  isValid: z.boolean(),
});

export type SchedulingOutput = z.infer<typeof SchedulingOutputSchema>;

export class SchedulingAgent {
  public async execute(
    task: AgentTask<SchedulingInput>
  ): Promise<AgentResult<SchedulingOutput>> {
    const startTime = Date.now();
    const input = SchedulingInputSchema.parse(task.input);
    const {
      campaignId,
      channel,
      startDate,
      endDate,
      timezone,
      contentCategory,
      blackoutWindows,
      existingSchedules,
    } = input;

    const startTs = new Date(startDate).getTime();
    const endTs = new Date(endDate).getTime();
    const now = Date.now();

    // Default peak hours per channel (UTC hour offset)
    const channelPeakHours: Record<string, number[]> = {
      linkedin: [9, 14],
      facebook: [13, 17],
      instagram: [12, 19],
      telegram: [10, 18],
    };

    const peakHours = channelPeakHours[channel] || [10, 15];
    const candidateSlots: ScheduledSlot[] = [];

    // Generate 3 candidate slots across campaign duration
    const baseDate = new Date(Math.max(now + 3600000, startTs)); // At least 1 hr in future

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const candidateDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const targetHour = peakHours[dayOffset % peakHours.length];
      candidateDate.setUTCHours(targetHour, 0, 0, 0);
      if (candidateDate.getTime() < startTs) {
        candidateDate.setTime(candidateDate.getTime() + 24 * 60 * 60 * 1000);
      }

      const slotTs = candidateDate.getTime();
      const isoSlot = candidateDate.toISOString();

      // Bounds check
      const isWithinCampaignBounds = slotTs >= startTs && slotTs <= endTs;

      const blackoutList = blackoutWindows || [];
      const existingList = existingSchedules || [];

      // Blackout check
      const isBlackoutCollision = blackoutList.some((b) => isoSlot.startsWith(b.slice(0, 10)));

      // Collision check with existing schedules
      const isCollision = existingList.some((s) => s.slice(0, 13) === isoSlot.slice(0, 13));

      if (isWithinCampaignBounds && !isBlackoutCollision && !isCollision) {
        const confidence = contentCategory === 'time_sensitive' && dayOffset === 0 ? 0.95 : 0.85 - dayOffset * 0.05;
        candidateSlots.push({
          slotId: `slot_${channel}_${dayOffset}_${Date.now()}`,
          channel,
          proposedTime: isoSlot,
          rank: candidateSlots.length + 1,
          confidence: Math.round(confidence * 100) / 100,
          rationale: `Optimal peak hour (${targetHour}:00 UTC) for ${channel} during ${contentCategory} campaign window.`,
          isWithinCampaignBounds,
          isBlackoutCollision,
        });
      }

      if (candidateSlots.length >= 3) break;
    }

    const selectedSlot = candidateSlots[0];
    const isValid = candidateSlots.length > 0;

    const output: SchedulingOutput = {
      channel,
      recommendedSlots: candidateSlots,
      selectedSlot,
      isValid,
    };

    return {
      taskId: task.taskId,
      agentName: 'SchedulingAgent',
      status: isValid ? 'completed' : 'failed',
      output,
      confidence: isValid ? candidateSlots[0].confidence : 0,
      warnings: !isValid ? ['Unable to find valid publishing window within campaign bounds & blackout rules.'] : [],
      evidence: [],
      evaluationScores: {
        candidateSlotCount: candidateSlots.length,
        selectedRank: selectedSlot?.rank || 0,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'deterministic-scheduling-engine-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const schedulingAgent = new SchedulingAgent();

// Register in AgentRegistry
agentRegistry.register({
  name: 'SchedulingAgent',
  version: '1.0.0',
  description: 'Calculates timezone-safe, peak-hour ranked publishing slots obeying campaign bounds and blackout rules',
  executionMode: 'deterministic',
  inputSchema: SchedulingInputSchema,
  outputSchema: SchedulingOutputSchema,
  allowedTools: ['slot_calculator', 'blackout_checker'],
  enabled: true,
  handler: (task) => schedulingAgent.execute(task),
});
