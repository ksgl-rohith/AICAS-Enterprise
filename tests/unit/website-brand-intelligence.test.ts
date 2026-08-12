import { describe, it, expect } from 'vitest';
import { websiteBrandIntelligenceAgent } from '@/lib/ai/website-brand-intelligence-agent';
import { brandNameDiscovery } from '@/lib/brand/brand-name-discovery';

describe('Website Brand Intelligence Agent & SSRF Security Safeguards', () => {
  it('blocks localhost, internal domains, and private IP ranges to prevent SSRF', () => {
    const localhostCheck = websiteBrandIntelligenceAgent.validateUrlForSsrf('http://localhost:3000/admin');
    expect(localhostCheck.safe).toBe(false);
    expect(localhostCheck.reason).toContain('restricted');

    const privateIpCheck = websiteBrandIntelligenceAgent.validateUrlForSsrf('http://192.168.1.100/internal');
    expect(privateIpCheck.safe).toBe(false);

    const cloudMetadataCheck = websiteBrandIntelligenceAgent.validateUrlForSsrf('http://169.254.169.254/latest/meta-data/');
    expect(cloudMetadataCheck.safe).toBe(false);
  });

  it('validates public website URLs safely', () => {
    const validCheck = websiteBrandIntelligenceAgent.validateUrlForSsrf('https://stripe.com');
    expect(validCheck.safe).toBe(true);
    expect(validCheck.url?.hostname).toBe('stripe.com');
  });

  it('extracts structured Brand DNA intelligence with confidence & evidence', async () => {
    const intel = await websiteBrandIntelligenceAgent.extractBrandIntelligence('https://apexai.solutions');

    expect(intel.domain).toBe('apexai.solutions');
    expect(intel.identity.name.confidence).toBeGreaterThan(0.8);
    expect(intel.identity.name.value).not.toBe('WWW');
    expect(intel.identity.name.value).not.toBe('www');
    expect(intel.identity.name.evidenceExcerpt).toBeDefined();
    expect(intel.voiceAndGovernance.defaultCTA.value).toBeDefined();
    expect(intel.extractedChunks.length).toBeGreaterThan(0);
  });

  it('correctly normalizes www URLs so brand name is never www', () => {
    const norm = brandNameDiscovery.normalizeDomain('https://www.policybazaar.com');
    expect(norm.hostname).toBe('policybazaar.com');
    expect(norm.primaryLabel).toBe('Policybazaar');
    expect(norm.primaryLabel).not.toBe('WWW');
    expect(norm.primaryLabel).not.toBe('www');

    const identity = brandNameDiscovery.discoverBrandIdentity(
      'https://www.policybazaar.com',
      '<meta property="og:site_name" content="Policybazaar Insurance" />',
      'Policybazaar - Health & Motor Insurance',
      'Compare insurance online.'
    );
    expect(identity.brandName).toBe('Policybazaar Insurance');
    expect(identity.brandName).not.toBe('www');
  });
});
