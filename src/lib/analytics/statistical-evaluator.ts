/**
 * Statistical Evaluator Module
 * Provides pure deterministic statistical algorithms for experiment evaluation,
 * hypothesis testing, sample size sufficiency, and confidence calculations.
 */

export interface ProportionSample {
  successes: number;
  total: number;
}

export interface ContinuousSample {
  mean: number;
  variance: number;
  sampleSize: number;
}

export interface StatisticalTestResult {
  metricName: string;
  variantA: string;
  variantB: string;
  controlRateOrMean: number;
  treatmentRateOrMean: number;
  relativeLift: number; // percentage lift e.g., 0.15 for +15%
  pValue: number;
  confidenceLevel: number; // e.g., 0.95
  isStatisticallySignificant: boolean;
  sampleSizeSufficient: boolean;
  recommendedWinner?: string;
  explanation: string;
}

export class StatisticalEvaluator {
  /**
   * Two-Proportion Z-Test for Click-Through Rates, Conversions, or Binary Outcomes.
   */
  public evaluateProportionTest(
    metricName: string,
    variantAName: string,
    sampleA: ProportionSample,
    variantBName: string,
    sampleB: ProportionSample,
    minSampleSize: number = 100,
    confidenceThreshold: number = 0.95
  ): StatisticalTestResult {
    const rateA = sampleA.total > 0 ? sampleA.successes / sampleA.total : 0;
    const rateB = sampleB.total > 0 ? sampleB.successes / sampleB.total : 0;
    const sampleSufficient = sampleA.total >= minSampleSize && sampleB.total >= minSampleSize;

    if (!sampleSufficient || sampleA.total === 0 || sampleB.total === 0) {
      return {
        metricName,
        variantA: variantAName,
        variantB: variantBName,
        controlRateOrMean: rateA,
        treatmentRateOrMean: rateB,
        relativeLift: rateA > 0 ? (rateB - rateA) / rateA : 0,
        pValue: 1.0,
        confidenceLevel: 0.0,
        isStatisticallySignificant: false,
        sampleSizeSufficient: false,
        explanation: `Sample size insufficient (Variant A: ${sampleA.total}, Variant B: ${sampleB.total}, Required: ${minSampleSize}).`,
      };
    }

    const pooledRate = (sampleA.successes + sampleB.successes) / (sampleA.total + sampleB.total);
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / sampleA.total + 1 / sampleB.total)
    );

    let zScore = 0;
    if (standardError > 0) {
      zScore = (rateB - rateA) / standardError;
    }

    // Two-tailed p-value approximation via normal distribution error function
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    const confidenceLevel = 1 - pValue;
    const isSignificant = confidenceLevel >= confidenceThreshold;
    const relativeLift = rateA > 0 ? (rateB - rateA) / rateA : 0;

    let winner: string | undefined;
    if (isSignificant) {
      winner = rateB > rateA ? variantBName : variantAName;
    }

    return {
      metricName,
      variantA: variantAName,
      variantB: variantBName,
      controlRateOrMean: rateA,
      treatmentRateOrMean: rateB,
      relativeLift,
      pValue,
      confidenceLevel,
      isStatisticallySignificant: isSignificant,
      sampleSizeSufficient: true,
      recommendedWinner: winner,
      explanation: isSignificant
        ? `${variantBName} achieved a ${(relativeLift * 100).toFixed(1)}% lift over ${variantAName} with ${(confidenceLevel * 100).toFixed(1)}% statistical confidence (p=${pValue.toFixed(4)}).`
        : `No statistically significant difference detected between ${variantAName} and ${variantBName} (confidence: ${(confidenceLevel * 100).toFixed(1)}%, p=${pValue.toFixed(4)}).`,
    };
  }

  /**
   * Welch's t-test for Continuous Metrics (e.g. watch time, revenue per user, engagement score).
   */
  public evaluateContinuousTest(
    metricName: string,
    variantAName: string,
    sampleA: ContinuousSample,
    variantBName: string,
    sampleB: ContinuousSample,
    minSampleSize: number = 100,
    confidenceThreshold: number = 0.95
  ): StatisticalTestResult {
    const sampleSufficient = sampleA.sampleSize >= minSampleSize && sampleB.sampleSize >= minSampleSize;

    if (!sampleSufficient || sampleA.sampleSize === 0 || sampleB.sampleSize === 0) {
      return {
        metricName,
        variantA: variantAName,
        variantB: variantBName,
        controlRateOrMean: sampleA.mean,
        treatmentRateOrMean: sampleB.mean,
        relativeLift: sampleA.mean > 0 ? (sampleB.mean - sampleA.mean) / sampleA.mean : 0,
        pValue: 1.0,
        confidenceLevel: 0.0,
        isStatisticallySignificant: false,
        sampleSizeSufficient: false,
        explanation: `Sample size insufficient for continuous test (Required: ${minSampleSize}).`,
      };
    }

    const seA = sampleA.variance / sampleA.sampleSize;
    const seB = sampleB.variance / sampleB.sampleSize;
    const totalSE = Math.sqrt(seA + seB);

    const tStat = totalSE > 0 ? (sampleB.mean - sampleA.mean) / totalSE : 0;
    const pValue = 2 * (1 - this.normalCDF(Math.abs(tStat)));
    const confidenceLevel = 1 - pValue;
    const isSignificant = confidenceLevel >= confidenceThreshold;
    const relativeLift = sampleA.mean > 0 ? (sampleB.mean - sampleA.mean) / sampleA.mean : 0;

    return {
      metricName,
      variantA: variantAName,
      variantB: variantBName,
      controlRateOrMean: sampleA.mean,
      treatmentRateOrMean: sampleB.mean,
      relativeLift,
      pValue,
      confidenceLevel,
      isStatisticallySignificant: isSignificant,
      sampleSizeSufficient: true,
      recommendedWinner: isSignificant ? (sampleB.mean > sampleA.mean ? variantBName : variantAName) : undefined,
      explanation: isSignificant
        ? `${variantBName} continuous mean (${sampleB.mean.toFixed(2)}) outperformed ${variantAName} (${sampleA.mean.toFixed(2)}) with ${(confidenceLevel * 100).toFixed(1)}% confidence.`
        : `Continuous difference not significant (p=${pValue.toFixed(4)}).`,
    };
  }

  /**
   * Cumulative Normal Distribution Function approximation (Abramowitz & Stegun formula)
   */
  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * x);
    const poly =
      t *
      (0.31938153 +
        t *
          (-0.356563782 +
            t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp((-x * x) / 2) * poly;
  }
}

export const statisticalEvaluator = new StatisticalEvaluator();
