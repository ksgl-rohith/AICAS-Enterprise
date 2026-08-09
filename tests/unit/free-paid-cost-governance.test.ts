import { describe, it, expect, vi, beforeEach } from 'vitest';
import { modelGateway } from '@/lib/ai/model-gateway';

describe('Model Gateway Free vs Paid Model Usage & Cost Governance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('classifies mock engine invocations as FREE billing class', () => {
    const { cost, billingClass, billingSubtype } = modelGateway.calculateTokenCost('mock-engine-v1', 500);
    expect(billingClass).toBe('FREE');
    expect(billingSubtype).toBe('mock_engine');
    expect(cost).toBe(0);
  });

  it('classifies token billed models as PAID billing class', () => {
    const { cost, billingClass, billingSubtype } = modelGateway.calculateTokenCost('gpt-4o', 1000);
    expect(billingClass).toBe('PAID');
    expect(billingSubtype).toBe('token_billed');
    expect(cost).toBe(0.005);
  });
});
