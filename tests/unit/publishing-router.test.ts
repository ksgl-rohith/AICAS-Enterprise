import { describe, it, expect } from 'vitest';
import { publishingRouter } from '../../src/lib/connectors/publishing-router';
import { simulatedConnector } from '../../src/lib/connectors/simulated-connector';

describe('Publishing Router and Simulated Fallback', () => {
  it('should publish successfully in simulated mode', async () => {
    const origMode = process.env.PUBLISHING_MODE;
    process.env.PUBLISHING_MODE = 'simulated';

    try {
      const res = await publishingRouter.publish({
        publicationId: 'pub_test_1',
        brandId: 'brand_test',
        channel: 'linkedin',
        hook: 'Test Hook',
        bodyText: 'Test Body Content',
        ctaText: 'Test CTA',
        idempotencyKey: 'idemp_test_123',
      });

      expect(res.success).toBe(true);
      expect(res.isSimulated).toBe(true);
      expect(res.externalPostId).toContain('sim_');
      expect(res.permalink).toContain('linkedin.com');
    } finally {
      process.env.PUBLISHING_MODE = origMode;
    }
  });

  it('should publish directly via simulated connector', async () => {
    const res = await simulatedConnector.publish({
      publicationId: 'pub_test_2',
      brandId: 'brand_test',
      channel: 'facebook',
      hook: 'Direct Sim Hook',
      bodyText: 'Direct Sim Body',
      ctaText: 'Direct Sim CTA',
      idempotencyKey: 'idemp_test_456',
    });

    expect(res.success).toBe(true);
    expect(res.isSimulated).toBe(true);
    expect(res.externalPostId).toContain('sim_facebook_');
  });
});
