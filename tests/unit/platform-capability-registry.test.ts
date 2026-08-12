import { describe, it, expect } from 'vitest';
import { connectorCapabilityRegistry, CONNECTOR_CAPABILITIES } from '@/lib/connectors/connector-capability-registry';

describe('Connector Capability Registry', () => {
  it('registers capabilities for 13 social, video, messaging, and CMS platforms', () => {
    const all = connectorCapabilityRegistry.getAllCapabilities();
    expect(all.length).toBe(13);
  });

  it('correctly maps status AVAILABLE, BETA, API_APPROVAL_REQUIRED, and EXPORT_ONLY', () => {
    const linkedin = connectorCapabilityRegistry.getCapability('linkedin');
    expect(linkedin?.status).toBe('AVAILABLE');

    const tiktok = connectorCapabilityRegistry.getCapability('tiktok');
    expect(tiktok?.status).toBe('API_APPROVAL_REQUIRED');

    const wordpress = connectorCapabilityRegistry.getCapability('wordpress');
    expect(wordpress?.status).toBe('EXPORT_ONLY');
  });

  it('filters connector capabilities cleanly by integration group', () => {
    const social = connectorCapabilityRegistry.getCapabilitiesByGroup('Social Publishing');
    expect(social.length).toBe(6);
    expect(social.map((s) => s.platform)).toContain('linkedin');
    expect(social.map((s) => s.platform)).toContain('instagram');

    const video = connectorCapabilityRegistry.getCapabilitiesByGroup('Video');
    expect(video.length).toBe(1);
    expect(video[0].platform).toBe('youtube');
  });
});
