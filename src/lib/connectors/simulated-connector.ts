import { ConnectionResult, PlatformMetrics, PublishRequest, PublishResult, SocialConnector } from './types';

export class SimulatedConnector implements SocialConnector {
  public platform: 'simulated' = 'simulated';

  public async isConfigured(): Promise<boolean> {
    return true; // Always available
  }

  public async testConnection(): Promise<ConnectionResult> {
    return {
      success: true,
      accountName: 'AICAS Simulated Sandbox Account',
      accountId: 'sim_acc_001',
      scopes: ['w_member_social', 'pages_manage_posts', 'instagram_basic'],
    };
  }

  public async publish(request: PublishRequest): Promise<PublishResult> {
    // Simulate brief network latency
    await new Promise((resolve) => setTimeout(resolve, 350));

    const hash = request.idempotencyKey.slice(0, 8);
    const externalPostId = `sim_${request.channel}_${hash}_${Date.now()}`;
    
    let permalink = `https://simulated.${request.channel}.com/post/${externalPostId}`;
    if (request.channel === 'linkedin') {
      permalink = `https://linkedin.com/feed/update/urn:li:activity:${externalPostId}`;
    } else if (request.channel === 'facebook') {
      permalink = `https://facebook.com/posts/${externalPostId}`;
    } else if (request.channel === 'instagram') {
      permalink = `https://instagram.com/p/${externalPostId}`;
    } else if (request.channel === 'telegram') {
      permalink = `https://t.me/apexai_updates/${externalPostId}`;
    }

    return {
      success: true,
      externalPostId,
      permalink,
      isSimulated: true,
      publishedAt: new Date(),
    };
  }

  public async fetchMetrics(): Promise<PlatformMetrics> {
    return {
      impressions: Math.floor(1000 + Math.random() * 5000),
      reach: Math.floor(800 + Math.random() * 4000),
      engagements: Math.floor(100 + Math.random() * 600),
      clicks: Math.floor(20 + Math.random() * 150),
      saves: Math.floor(10 + Math.random() * 80),
      shares: Math.floor(5 + Math.random() * 40),
      conversions: Math.floor(2 + Math.random() * 15),
    };
  }
}

export const simulatedConnector = new SimulatedConnector();
