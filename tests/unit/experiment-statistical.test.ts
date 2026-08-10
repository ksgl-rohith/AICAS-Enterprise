import { describe, it, expect } from 'vitest';
import { statisticalEvaluator } from '@/lib/analytics/statistical-evaluator';

describe('StatisticalEvaluator for Experiments', () => {
  it('should return insufficient sample size when total impressions are below minimum requirement', () => {
    const result = statisticalEvaluator.evaluateProportionTest(
      'ctr',
      'Control Post',
      { successes: 5, total: 40 },
      'Treatment Post',
      { successes: 10, total: 40 },
      100
    );

    expect(result.sampleSizeSufficient).toBe(false);
    expect(result.isStatisticallySignificant).toBe(false);
    expect(result.explanation).toContain('Sample size insufficient');
  });

  it('should evaluate a statistically significant proportion test and declare a winner', () => {
    const result = statisticalEvaluator.evaluateProportionTest(
      'ctr',
      'Control Question Hook',
      { successes: 20, total: 500 }, // 4% CTR
      'Treatment Value Hook',
      { successes: 55, total: 500 }, // 11% CTR
      100,
      0.95
    );

    expect(result.sampleSizeSufficient).toBe(true);
    expect(result.isStatisticallySignificant).toBe(true);
    expect(result.recommendedWinner).toBe('Treatment Value Hook');
    expect(result.confidenceLevel).toBeGreaterThanOrEqual(0.95);
    expect(result.relativeLift).toBeGreaterThan(0);
  });

  it('should evaluate non-significant results as inconclusive without declaring a winner', () => {
    const result = statisticalEvaluator.evaluateProportionTest(
      'ctr',
      'Control Variant A',
      { successes: 25, total: 300 }, // 8.33% CTR
      'Treatment Variant B',
      { successes: 26, total: 300 }, // 8.66% CTR
      100,
      0.95
    );

    expect(result.sampleSizeSufficient).toBe(true);
    expect(result.isStatisticallySignificant).toBe(false);
    expect(result.recommendedWinner).toBeUndefined();
    expect(result.explanation).toContain('No statistically significant difference detected');
  });
});
