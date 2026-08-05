import { describe, it, expect } from 'vitest';
import { statisticalEvaluator } from '../../src/lib/analytics/statistical-evaluator';

describe('Deterministic Statistical Evaluator Module', () => {
  it('should evaluate two-proportion Z-test and compute p-value and confidence level', () => {
    const sampleA = { successes: 14, total: 1000 }; // 1.4% CTR
    const sampleB = { successes: 48, total: 1000 }; // 4.8% CTR

    const result = statisticalEvaluator.evaluateProportionTest(
      'ctr',
      'Control Text Post',
      sampleA,
      'Treatment Technical Carousel',
      sampleB,
      100,
      0.95
    );

    expect(result.isStatisticallySignificant).toBe(true);
    expect(result.sampleSizeSufficient).toBe(true);
    expect(result.confidenceLevel).toBeGreaterThan(0.99);
    expect(result.recommendedWinner).toBe('Treatment Technical Carousel');
    expect(result.relativeLift).toBeGreaterThan(2.0);
  });

  it('should fail sample size sufficiency if under minimum requirement', () => {
    const sampleA = { successes: 2, total: 20 };
    const sampleB = { successes: 8, total: 20 };

    const result = statisticalEvaluator.evaluateProportionTest(
      'ctr',
      'Control',
      sampleA,
      'Treatment',
      sampleB,
      100
    );

    expect(result.sampleSizeSufficient).toBe(false);
    expect(result.isStatisticallySignificant).toBe(false);
  });

  it('should evaluate Welch t-test for continuous metrics', () => {
    const sampleA = { mean: 12.5, variance: 4.0, sampleSize: 200 };
    const sampleB = { mean: 24.8, variance: 6.0, sampleSize: 200 };

    const result = statisticalEvaluator.evaluateContinuousTest(
      'watchTime',
      'Variant A',
      sampleA,
      'Variant B',
      sampleB,
      100
    );

    expect(result.isStatisticallySignificant).toBe(true);
    expect(result.recommendedWinner).toBe('Variant B');
  });
});
