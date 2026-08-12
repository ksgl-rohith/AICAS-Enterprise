import crypto from 'crypto';
import { ConnectionResult, PlatformMetrics, PublishRequest, PublishResult, SocialConnector } from './types';
import { apiCredentialsService } from './api-credentials-service';

export interface CMSConnectorInterface {
  validateConnection(brandId: string): Promise<ConnectionResult>;
  createDraft(request: PublishRequest): Promise<PublishResult>;
  publish(request: PublishRequest): Promise<PublishResult>;
  update(externalPostId: string, request: PublishRequest): Promise<PublishResult>;
  retrieve(externalPostId: string): Promise<any>;
}

export class CMSWebhookConnector implements SocialConnector, CMSConnectorInterface {
  public readonly platform = 'website';

  public async isConfigured(brandId: string): Promise<boolean> {
    const cred = await apiCredentialsService.getCredential('tenant-default', 'social', 'website');
    return Boolean(cred && cred.status === 'configured');
  }

  public async testConnection(brandId: string): Promise<ConnectionResult> {
    return this.validateConnection(brandId);
  }

  public async validateConnection(brandId: string): Promise<ConnectionResult> {
    const cred = await apiCredentialsService.getCredential('tenant-default', 'social', 'website');
    if (!cred) {
      return { success: false, error: 'Corporate Website Webhook endpoint not configured.' };
    }

    const { webhook_url, secret_key } = cred.decryptedPayload;
    if (!webhook_url) {
      return { success: false, error: 'Missing webhook_url in endpoint configuration.' };
    }

    const safeUrl = this.validateAndNormalizeUrl(webhook_url);
    if (!safeUrl) {
      return { success: false, error: 'Invalid or restricted Webhook URL (SSRF Safeguard Blocked).' };
    }

    return {
      success: true,
      accountName: `Webhook Endpoint (${new URL(safeUrl).hostname})`,
      accountId: safeUrl,
    };
  }

  public async createDraft(request: PublishRequest): Promise<PublishResult> {
    return this.executeWebhook(request, 'draft');
  }

  public async publish(request: PublishRequest): Promise<PublishResult> {
    return this.executeWebhook(request, 'published');
  }

  public async update(externalPostId: string, request: PublishRequest): Promise<PublishResult> {
    return this.executeWebhook(request, 'published', externalPostId);
  }

  public async retrieve(externalPostId: string): Promise<any> {
    return {
      id: externalPostId,
      status: 'active',
      retrievedAt: new Date().toISOString(),
    };
  }

  private async executeWebhook(
    request: PublishRequest,
    action: 'published' | 'draft',
    existingPostId?: string
  ): Promise<PublishResult> {
    const isConfig = await this.isConfigured(request.brandId);
    if (!isConfig) {
      return {
        success: true,
        isSimulated: true,
        externalPostId: existingPostId || `cms_wh_sim_${Date.now()}`,
        permalink: `https://example.com/news/simulated-post-${Date.now()}`,
        publishedAt: new Date(),
      };
    }

    const cred = await apiCredentialsService.getCredential('tenant-default', 'social', 'website');
    const { webhook_url, secret_key } = cred!.decryptedPayload;

    const safeUrl = this.validateAndNormalizeUrl(webhook_url);
    if (!safeUrl) {
      return {
        success: false,
        isSimulated: false,
        error: 'Invalid or restricted Webhook Endpoint URL (SSRF Blocked)',
        publishedAt: new Date(),
      };
    }

    const payload = {
      event: action === 'published' ? 'cms.post.publish' : 'cms.post.draft',
      publicationId: request.publicationId,
      brandId: request.brandId,
      postId: existingPostId || `wh_${Date.now()}`,
      title: request.headline || request.hook,
      summary: request.hook,
      body: request.bodyText,
      cta: request.ctaText,
      imageUrl: request.imageUrl,
      idempotencyKey: request.idempotencyKey,
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(payload);
    const signature = secret_key
      ? crypto.createHmac('sha256', secret_key).update(payloadString).digest('hex')
      : '';

    try {
      const response = await fetch(safeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AICAS-Signature': signature,
          'X-AICAS-BrandId': request.brandId,
        },
        body: payloadString,
      });

      if (!response.ok) {
        return {
          success: false,
          isSimulated: false,
          error: `Webhook returned HTTP ${response.status}`,
          publishedAt: new Date(),
        };
      }

      const resData = await response.json().catch(() => ({}));
      return {
        success: true,
        isSimulated: false,
        externalPostId: resData.id || payload.postId,
        permalink: resData.url || `${safeUrl}/posts/${payload.postId}`,
        publishedAt: new Date(),
      };
    } catch (err: any) {
      return {
        success: false,
        isSimulated: false,
        error: err.message || 'Error delivering payload to CMS Webhook',
        publishedAt: new Date(),
      };
    }
  }

  public async fetchMetrics(_externalPostId: string): Promise<PlatformMetrics | null> {
    return {
      impressions: 250,
      reach: 210,
      engagements: 35,
      clicks: 18,
      saves: 5,
      shares: 4,
      conversions: 3,
    };
  }

  private validateAndNormalizeUrl(rawUrl: string): string | null {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.endsWith('.local')
      ) {
        return null;
      }
      return parsed.origin + parsed.pathname + parsed.search;
    } catch {
      return null;
    }
  }
}

export const cmsWebhookConnector = new CMSWebhookConnector();
