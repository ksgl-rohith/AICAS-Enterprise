import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { auditService } from '@/lib/services/audit-service';

export interface PostForecastInput {
  brandId: string;
  campaignId?: string;
  contentItemId?: string;
  channel: 'linkedin' | 'facebook' | 'instagram' | 'telegram' | 'youtube' | 'x';
  format: 'text_post' | 'image_post' | 'carousel' | 'video_script';
  objective?: string;
  topic?: string;
  cta?: string;
  copyLength?: number;
  publishingTime?: string; // HH:mm
  dayOfWeek?: string;
}

export interface PerformanceFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weightPercentage: number;
  explanation: string;
}

export interface PostForecastOutput {
  channel: string;
  metric: 'reach' | 'impressions' | 'engagements' | 'ctr' | 'conversions';
  predictedValue: number;
  lowerBound: number;
  upperBound: number;
  confidence: 'High' | 'Medium' | 'Low';
  dataSufficiency: 'Sufficient' | 'Sparse' | 'ColdStart';
  baseline: number;
  expectedLiftPercentage: number;
  modelVersion: string;
  keyFactors: PerformanceFactor[];
}

export class ForecastingAgent {
  /**
   * Deterministic Performance Forecast Engine
   */
  public async predictPerformance(
    input: PostForecastInput,
    tenantId: string = 'tenant-default'
  ): Promise<PostForecastOutput> {
    // Fetch historical metric events for this brand and channel
    const historicalMetrics = await db.normalizedMetricEvent.findMany({
      where: {
        tenantId,
        brandId: input.brandId,
        platform: input.channel,
      },
      orderBy: { occurredAt: 'desc' },
      take: 50,
    });

    const dataSufficiency: 'Sufficient' | 'Sparse' | 'ColdStart' =
      historicalMetrics.length >= 10
        ? 'Sufficient'
        : historicalMetrics.length > 0
        ? 'Sparse'
        : 'ColdStart';

    // Channel baselines (used when cold-start or sparse history)
    const channelBaselines: Record<string, number> = {
      linkedin: 2400,
      facebook: 1800,
      instagram: 3200,
      telegram: 1200,
      youtube: 5500,
      x: 1500,
    };

    let baseline = channelBaselines[input.channel] || 2000;

    // If historical data exists, calculate actual weighted average
    if (historicalMetrics.length > 0) {
      let sumReach = 0;
      let count = 0;
      for (const item of historicalMetrics) {
        try {
          const parsed = JSON.parse(item.metricsJson);
          if (parsed.reach || parsed.impressions) {
            sumReach += parsed.reach || parsed.impressions || 0;
            count++;
          }
        } catch {
          // ignore malformed
        }
      }
      if (count > 0) {
        baseline = Math.round(sumReach / count);
      }
    }

    // Feature impact multipliers (deterministic rule-based)
    let formatMultiplier = 1.0;
    const keyFactors: PerformanceFactor[] = [];

    if (input.format === 'carousel') {
      formatMultiplier += 0.25;
      keyFactors.push({
        factor: 'Carousel Content Format',
        impact: 'positive',
        weightPercentage: 25,
        explanation: 'Multi-slide visual carousels demonstrate +25% higher reach on professional channels.',
      });
    } else if (input.format === 'video_script') {
      formatMultiplier += 0.35;
      keyFactors.push({
        factor: 'Short Video / Reel Format',
        impact: 'positive',
        weightPercentage: 35,
        explanation: 'Video assets generate +35% algorithmic preference on social feeds.',
      });
    }

    if (input.cta && input.cta.length > 5) {
      formatMultiplier += 0.10;
      keyFactors.push({
        factor: 'Explicit CTA Included',
        impact: 'positive',
        weightPercentage: 10,
        explanation: 'Clear CTA boosts audience interaction rate.',
      });
    }

    // Cold start confidence reduction
    let confidence: 'High' | 'Medium' | 'Low' = 'High';
    if (dataSufficiency === 'ColdStart') {
      confidence = 'Low';
      keyFactors.push({
        factor: 'Cold Start Baseline',
        impact: 'neutral',
        weightPercentage: 0,
        explanation: 'No prior tenant post history found. Using platform enterprise baseline.',
      });
    } else if (dataSufficiency === 'Sparse') {
      confidence = 'Medium';
    }

    const predictedValue = Math.round(baseline * formatMultiplier);
    const margin = confidence === 'High' ? 0.12 : confidence === 'Medium' ? 0.20 : 0.30;
    const lowerBound = Math.round(predictedValue * (1 - margin));
    const upperBound = Math.round(predictedValue * (1 + margin));
    const expectedLiftPercentage = Math.round(((predictedValue - baseline) / baseline) * 100);

    const forecast: PostForecastOutput = {
      channel: input.channel,
      metric: 'reach',
      predictedValue,
      lowerBound,
      upperBound,
      confidence,
      dataSufficiency,
      baseline,
      expectedLiftPercentage,
      modelVersion: 'v1.0-deterministic-forecast',
      keyFactors,
    };

    // Store forecast in database for evaluation
    await db.performanceForecast.create({
      data: {
        tenantId,
        brandId: input.brandId,
        campaignId: input.campaignId || null,
        contentItemId: input.contentItemId || null,
        channel: input.channel,
        metric: 'reach',
        predictedValue,
        lowerBound,
        upperBound,
        confidence,
        dataSufficiency,
        baseline,
        expectedLift: expectedLiftPercentage,
        modelVersion: 'v1.0-deterministic-forecast',
        keyFactorsJson: JSON.stringify(keyFactors),
      },
    });

    return forecast;
  }

  /**
   * Evaluate actual vs predicted outcome when post metrics arrive.
   */
  public async evaluateForecastOutcome(forecastId: string, actualReach: number) {
    const forecast = await db.performanceForecast.findUnique({ where: { id: forecastId } });
    if (!forecast) return null;

    const mae = Math.abs(forecast.predictedValue - actualReach);
    const rmse = Math.sqrt(Math.pow(forecast.predictedValue - actualReach, 2));
    const mape = (mae / Math.max(actualReach, 1)) * 100;

    const updated = await db.performanceForecast.update({
      where: { id: forecastId },
      data: {
        actualValue: actualReach,
        evaluatedAt: new Date(),
        mae,
        rmse,
        mape,
      },
    });

    await auditService.recordEvent({
      tenantId: forecast.tenantId,
      category: 'Forecasting',
      action: 'forecast.evaluated',
      details: `Evaluated forecast for ${forecast.channel}: predicted ${forecast.predictedValue}, actual ${actualReach} (MAPE: ${mape.toFixed(1)}%)`,
      entityType: 'PerformanceForecast',
      entityId: forecastId,
      metadata: { mae, rmse, mape, predicted: forecast.predictedValue, actual: actualReach },
    });

    return updated;
  }
}

export const forecastingAgent = new ForecastingAgent();
