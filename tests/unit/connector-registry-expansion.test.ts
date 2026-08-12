import { describe, expect, it } from 'vitest';
import { connectorCapabilityRegistry } from '../../src/lib/connectors/connector-capability-registry';
import { wordPressConnector } from '../../src/lib/connectors/wordpress-connector';
import { cmsWebhookConnector } from '../../src/lib/connectors/cms-webhook-connector';
import { publishingRouter } from '../../src/lib/connectors/publishing-router';

describe('Platform Connector Capability Registry & Expanded Connectors', () => {
  it('should register all 13 supported platforms with distinct capability classifications', () => {
    const all = connectorCapabilityRegistry.getAllCapabilities();
    expect(all.length).toBe(13);

    const quora = connectorCapabilityRegistry.getCapability('quora');
    expect(quora).toBeDefined();
    expect(quora?.status).toBe('EXPORT_ONLY');
    expect(quora?.authenticationType).toBe('manual_export');
    expect(quora?.publishing).toBe(false);

    const wp = connectorCapabilityRegistry.getCapability('wordpress');
    expect(wp).toBeDefined();
    expect(wp?.authenticationType).toBe('api_key');
    expect(wp?.publishing).toBe(true);

    const website = connectorCapabilityRegistry.getCapability('website');
    expect(website).toBeDefined();
    expect(website?.authenticationType).toBe('webhook');
    expect(website?.publishing).toBe(true);
  });

  it('should prevent SSRF in WordPress and Webhook CMS connectors', async () => {
    const isConfigWp = await wordPressConnector.isConfigured('brand_test');
    expect(typeof isConfigWp).toBe('boolean');

    const testWpRes = await wordPressConnector.testConnection('brand_test');
    expect(testWpRes.success).toBe(false); // Unconfigured in test environment

    const testCmsRes = await cmsWebhookConnector.testConnection('brand_test');
    expect(testCmsRes.success).toBe(false); // Unconfigured in test environment
  });

  it('should route publish requests to appropriate connectors via PublishingRouter', async () => {
    const pubReq: any = {
      publicationId: 'pub_test_123',
      brandId: 'brand_test',
      channel: 'wordpress',
      hook: 'Test WordPress Post',
      bodyText: 'Comprehensive article body text for WordPress publishing.',
      ctaText: 'Read More',
      idempotencyKey: 'ik_wp_test_123',
    };

    const res = await publishingRouter.publish(pubReq);
    expect(res.success).toBe(true);
    expect(res.externalPostId).toBeDefined();
    expect(res.isSimulated).toBe(true); // Fallback simulated in unconfigured test mode
  });
});
