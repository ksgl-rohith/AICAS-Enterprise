import { db } from '@/lib/db';

export type AuditCategory =
  | 'Authentication'
  | 'Administration'
  | 'Brand'
  | 'Knowledge / RAG'
  | 'Campaign'
  | 'Agent Execution'
  | 'AI / Model'
  | 'Approval'
  | 'Compliance'
  | 'Content'
  | 'Scheduling'
  | 'Publishing'
  | 'Connector'
  | 'Analytics'
  | 'Forecasting'
  | 'Experiment'
  | 'Optimization'
  | 'Cost'
  | 'Credential'
  | 'Security'
  | 'Incident'
  | 'System';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditRecordParams {
  tenantId?: string;
  category: AuditCategory;
  severity?: AuditSeverity;
  action: string;
  details: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  brandId?: string;
  campaignId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  /**
   * Record a classified audit event in the database ledger.
   * Automatically redacts any keys matching password/secret/token patterns.
   */
  public async recordEvent(params: AuditRecordParams) {
    const tenantId = params.tenantId || 'tenant-default';
    const severity = params.severity || 'info';
    const entityType = params.entityType || 'System';
    const entityId = params.entityId || 'sys_0';

    // Redact metadata if present
    let sanitizedMetadataJson: string | undefined;
    if (params.metadata) {
      const sanitized = this.redactSecrets(params.metadata);
      sanitizedMetadataJson = JSON.stringify(sanitized);
    }

    try {
      const event = await db.auditEvent.create({
        data: {
          tenantId,
          category: params.category,
          severity,
          action: params.action,
          details: params.details,
          entityType,
          entityId,
          userId: params.userId || null,
          brandId: params.brandId || null,
          campaignId: params.campaignId || null,
          correlationId: params.correlationId || null,
          metadataJson: sanitizedMetadataJson || null,
        },
      });
      return event;
    } catch (err) {
      console.warn('[AuditService] Failed to persist audit record:', err);
      return null;
    }
  }

  /**
   * Recursively redact sensitive keys (passwords, tokens, secrets, client_secret).
   */
  private redactSecrets(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactSecrets(item));
    }
    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('apikey') ||
        lowerKey.includes('api_key') ||
        lowerKey.includes('auth')
      ) {
        redacted[key] = '[REDACTED_SECRET]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSecrets(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }
}

export const auditService = new AuditService();
