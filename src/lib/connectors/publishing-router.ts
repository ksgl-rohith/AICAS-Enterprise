import { cmsWebhookConnector } from './cms-webhook-connector';
import { facebookConnector } from './facebook-connector';
import { instagramConnector } from './instagram-connector';
import { linkedinConnector } from './linkedin-connector';
import { simulatedConnector } from './simulated-connector';
import { telegramConnector } from './telegram-connector';
import { PublishRequest, PublishResult, SocialConnector } from './types';
import { wordPressConnector } from './wordpress-connector';

export class PublishingRouter {
  public getConnector(channel: PublishRequest['channel']): SocialConnector {
    switch (channel) {
      case 'linkedin':
        return linkedinConnector;
      case 'facebook':
        return facebookConnector;
      case 'instagram':
        return instagramConnector;
      case 'telegram':
        return telegramConnector;
      case 'wordpress':
        return wordPressConnector;
      case 'website':
        return cmsWebhookConnector;
      default:
        return simulatedConnector;
    }
  }

  public async publish(request: PublishRequest): Promise<PublishResult> {
    const mode = process.env.PUBLISHING_MODE || 'simulated';
    const allowLive = process.env.ALLOW_LIVE_PUBLISHING === 'true';

    // Direct simulated mode
    if (mode === 'simulated' || !allowLive) {
      return simulatedConnector.publish(request);
    }

    // Live or Hybrid mode
    const connector = this.getConnector(request.channel);
    const isConfigured = await connector.isConfigured(request.brandId);

    if (!isConfigured) {
      if (mode === 'hybrid' || process.env.FALLBACK_TO_SIMULATOR === 'true') {
        console.info(`[PublishingRouter] Channel ${request.channel} not configured for live publishing. Falling back to simulator.`);
        return simulatedConnector.publish(request);
      }
      return {
        success: false,
        error: `Channel ${request.channel} is not connected. Please connect accounts under Settings -> Integrations.`,
        isSimulated: false,
        publishedAt: new Date(),
      };
    }

    return connector.publish(request);
  }
}

export const publishingRouter = new PublishingRouter();
