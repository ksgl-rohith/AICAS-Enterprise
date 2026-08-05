export interface TelemetryContext {
  tenantId?: string;
  brandId?: string;
  campaignId?: string;
  workflowId?: string;
  agentRunId?: string;
  contentId?: string;
  publicationId?: string;
  experimentId?: string;
  correlationId?: string;
}

export type TelemetryMetricName =
  | 'metrics_ingestion_lag'
  | 'analytics_job_failures'
  | 'experiment_health'
  | 'assignment_imbalance'
  | 'recommendation_acceptance'
  | 'cost_by_agent'
  | 'cost_anomalies'
  | 'budget_exhaustion'
  | 'community_escalation_volume'
  | 'localization_rejection'
  | 'video_generation_latency'
  | 'autonomy_bypass_attempts';

export interface TelemetryEvent {
  metricName: TelemetryMetricName;
  value: number;
  tags?: Record<string, string>;
  context: TelemetryContext;
  timestamp: string;
}

export class TelemetryService {
  private static instance: TelemetryService;
  private eventsLog: TelemetryEvent[] = [];

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public recordMetric(
    metricName: TelemetryMetricName,
    value: number,
    context: TelemetryContext = {},
    tags: Record<string, string> = {}
  ): void {
    const event: TelemetryEvent = {
      metricName,
      value,
      tags,
      context: {
        tenantId: context.tenantId || 'tenant-default',
        correlationId: context.correlationId || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...context,
      },
      timestamp: new Date().toISOString(),
    };

    this.eventsLog.push(event);
    if (this.eventsLog.length > 500) {
      this.eventsLog.shift(); // Keep bounded memory ring buffer
    }

    if (metricName === 'cost_anomalies' || metricName === 'autonomy_bypass_attempts') {
      console.warn(`[TELEMETRY ALERT] ${metricName}: value=${value}`, event);
    }
  }

  public getEvents(metricName?: TelemetryMetricName): TelemetryEvent[] {
    if (metricName) {
      return this.eventsLog.filter((e) => e.metricName === metricName);
    }
    return [...this.eventsLog];
  }
}

export const telemetryService = TelemetryService.getInstance();
