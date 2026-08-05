import { describe, it, expect } from 'vitest';
import { accessibilityAgent } from '../../src/lib/ai/accessibility-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Accessibility Agent', () => {
  it('should auto-generate alt text when missing for image posts', async () => {
    const task = createBaseTask('tenant-1', 'brand-1', {
      contentItemId: 'item_1',
      format: 'image_post' as const,
      text: 'AI Social OS Dashboard Infographic',
      visualConcept: 'Dark mode analytics dashboard with high-contrast charts.',
    });

    const res = await accessibilityAgent.execute(task);
    expect(res.output?.generatedAltText).toBeDefined();
    expect(res.output?.issues.some((i) => i.code === 'MISSING_ALT_TEXT')).toBe(true);
  });
});
