import { describe, it, expect, vi, beforeEach } from 'vitest';
import { forecastingAgent } from '@/lib/ai/forecasting-agent';
import { db } from '@/lib/db';

describe('Forecasting Agent & Performance Prediction Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('computes deterministic performance forecast ranges and factor weights', async () => {
    vi.spyOn(db.normalizedMetricEvent, 'findMany').mockResolvedValue([]);
    vi.spyOn(db.performanceForecast, 'create').mockResolvedValue({ id: 'fc-1' } as any);

    const forecast = await forecastingAgent.predictPerformance({
      brandId: 'b-1',
      channel: 'linkedin',
      format: 'carousel',
      cta: 'Request Enterprise Demo',
    });

    expect(forecast.channel).toBe('linkedin');
    expect(forecast.predictedValue).toBeGreaterThan(0);
    expect(forecast.lowerBound).toBeLessThan(forecast.predictedValue);
    expect(forecast.upperBound).toBeGreaterThan(forecast.predictedValue);
    expect(forecast.dataSufficiency).toBe('ColdStart');
    expect(forecast.confidence).toBe('Low');
    expect(forecast.keyFactors.length).toBeGreaterThan(0);
  });

  it('evaluates forecast outcomes against actual metrics for MAE and RMSE calculation', async () => {
    const mockForecast = {
      id: 'fc-1',
      tenantId: 'tenant-default',
      channel: 'linkedin',
      predictedValue: 3000,
    };

    vi.spyOn(db.performanceForecast, 'findUnique').mockResolvedValue(mockForecast as any);
    vi.spyOn(db.performanceForecast, 'update').mockResolvedValue({
      ...mockForecast,
      actualValue: 2800,
      mae: 200,
      rmse: 200,
      mape: 6.67,
    } as any);
    vi.spyOn(db.auditEvent, 'create').mockResolvedValue({} as any);

    const res = await forecastingAgent.evaluateForecastOutcome('fc-1', 2800);
    expect(res?.mae).toBe(200);
    expect(res?.mape).toBeCloseTo(6.67, 1);
  });
});
