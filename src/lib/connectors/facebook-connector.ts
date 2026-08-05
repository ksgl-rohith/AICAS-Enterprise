import { db } from '@/lib/db';
import { decryptToken, encryptToken } from '@/lib/crypto';
import { ConnectionResult, PlatformMetrics, PublishRequest, PublishResult, SocialConnector } from './types';

export class FacebookConnector implements SocialConnector {
  public platform: 'facebook' = 'facebook';

  private async getConnection(brandId?: string) {
    if (brandId) {
      const specific = await db.platformConnection.findUnique({
        where: { brandId_platform: { brandId, platform: 'facebook' } },
      });
      if (specific && specific.status === 'CONNECTED' && specific.encryptedAccessToken) {
        return specific;
      }
    }
    return await db.platformConnection.findFirst({
      where: { platform: 'facebook', status: 'CONNECTED' },
    });
  }

  public async isConfigured(brandId: string): Promise<boolean> {
    const connection = await this.getConnection(brandId);
    return !!(connection && connection.status === 'CONNECTED' && connection.encryptedAccessToken);
  }

  public getAuthUrl(state: string): string {
    const appId = process.env.META_APP_ID || '';
    const redirectUri = encodeURIComponent(
      process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/integrations/facebook/callback'
    );
    const scope = encodeURIComponent('public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish');
    return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
  }

  public async exchangeAuthCode(brandId: string, code: string): Promise<ConnectionResult> {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/integrations/facebook/callback';

    if (!appId || !appSecret) {
      return { success: false, error: 'Meta App ID or Secret missing in server environment variables.' };
    }

    try {
      // 1. Exchange code for short-lived user token
      const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error) {
        return { success: false, error: tokenData.error?.message || 'Failed to exchange Meta auth code.' };
      }

      const userToken = tokenData.access_token;

      // 2. Exchange for long-lived user token
      const longLivedUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${userToken}`;
      const longRes = await fetch(longLivedUrl);
      const longData = await longRes.json();
      const finalUserToken = longData.access_token || userToken;

      // 3. Fetch managed Facebook Pages
      const pagesRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${finalUserToken}`);
      const pagesData = await pagesRes.json();

      let pageId = process.env.FACEBOOK_PAGE_ID || '';
      let pageAccessToken = finalUserToken;
      let accountName = 'Facebook Page';

      if (pagesData.data && pagesData.data.length > 0) {
        const targetPage = pageId ? pagesData.data.find((p: any) => p.id === pageId) || pagesData.data[0] : pagesData.data[0];
        pageId = targetPage.id;
        pageAccessToken = targetPage.access_token;
        accountName = targetPage.name;
      }

      // Also check linked Instagram Business Account
      let instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID || '';
      if (pageId) {
        const igRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`);
        const igData = await igRes.json();
        if (igData.instagram_business_account?.id) {
          instagramAccountId = igData.instagram_business_account.id;
        }
      }

      // Save encrypted Facebook connection
      await db.platformConnection.upsert({
        where: { brandId_platform: { brandId, platform: 'facebook' } },
        update: {
          accountName,
          accountId: pageId,
          organizationId: instagramAccountId || null,
          encryptedAccessToken: encryptToken(pageAccessToken),
          tokenExpiry: new Date(Date.now() + 60 * 24 * 3600 * 1000), // ~60 days
          scopes: 'pages_manage_posts,pages_read_engagement,instagram_content_publish',
          status: 'CONNECTED',
          lastCheckedAt: new Date(),
          lastError: null,
        },
        create: {
          brandId,
          platform: 'facebook',
          accountName,
          accountId: pageId,
          organizationId: instagramAccountId || null,
          encryptedAccessToken: encryptToken(pageAccessToken),
          tokenExpiry: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          scopes: 'pages_manage_posts,pages_read_engagement,instagram_content_publish',
          status: 'CONNECTED',
          lastCheckedAt: new Date(),
        },
      });

      // Also auto-connect Instagram if linked
      if (instagramAccountId) {
        await db.platformConnection.upsert({
          where: { brandId_platform: { brandId, platform: 'instagram' } },
          update: {
            accountName: `${accountName} (Instagram)`,
            accountId: instagramAccountId,
            organizationId: pageId,
            encryptedAccessToken: encryptToken(pageAccessToken),
            status: 'CONNECTED',
            lastCheckedAt: new Date(),
          },
          create: {
            brandId,
            platform: 'instagram',
            accountName: `${accountName} (Instagram)`,
            accountId: instagramAccountId,
            organizationId: pageId,
            encryptedAccessToken: encryptToken(pageAccessToken),
            status: 'CONNECTED',
            lastCheckedAt: new Date(),
          },
        });
      }

      return {
        success: true,
        accountName,
        accountId: pageId,
        organizationId: instagramAccountId,
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error exchanging Facebook OAuth credentials.' };
    }
  }

  public async testConnection(brandId: string): Promise<ConnectionResult> {
    const connection = await this.getConnection(brandId);

    if (!connection || !connection.encryptedAccessToken) {
      return { success: false, error: 'Facebook is not connected.' };
    }

    const token = decryptToken(connection.encryptedAccessToken);
    if (!token) return { success: false, error: 'Failed to decrypt token.' };

    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${connection.accountId}?fields=name,id&access_token=${token}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        return { success: false, error: data.error?.message || 'Facebook Page test failed.' };
      }

      return {
        success: true,
        accountName: data.name || connection.accountName,
        accountId: data.id || connection.accountId,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  public async publish(request: PublishRequest): Promise<PublishResult> {
    const connection = await this.getConnection(request.brandId);

    const allowLive = process.env.ALLOW_LIVE_PUBLISHING === 'true';
    if (!allowLive || !connection || connection.status !== 'CONNECTED') {
      const hash = request.idempotencyKey.slice(0, 8);
      const simId = `sim_fb_${hash}_${Date.now()}`;
      return {
        success: true,
        externalPostId: simId,
        permalink: `https://facebook.com/posts/${simId}`,
        isSimulated: true,
        publishedAt: new Date(),
      };
    }

    const token = decryptToken(connection.encryptedAccessToken);
    const pageId = connection.accountId;
    const message = `${request.hook}\n\n${request.bodyText}\n\n${request.ctaText}\n\n${(request.hashtags || []).join(' ')}`.trim();

    try {
      const postUrl = `https://graph.facebook.com/v20.0/${pageId}/feed`;
      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          access_token: token,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        return {
          success: true,
          externalPostId: data.id,
          permalink: `https://facebook.com/${data.id}`,
          isSimulated: false,
          publishedAt: new Date(),
        };
      }

      console.error('Facebook Graph API error:', data);
      if (process.env.FALLBACK_TO_SIMULATOR === 'true') {
        const hash = request.idempotencyKey.slice(0, 8);
        return {
          success: true,
          externalPostId: `sim_fallback_fb_${hash}`,
          permalink: `https://facebook.com/posts/sim_${hash}`,
          isSimulated: true,
          publishedAt: new Date(),
        };
      }

      return {
        success: false,
        error: data.error?.message || 'Failed to post to Facebook Page',
        isSimulated: false,
        publishedAt: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Facebook network error',
        isSimulated: false,
        publishedAt: new Date(),
      };
    }
  }

  public async fetchMetrics(): Promise<PlatformMetrics | null> {
    return {
      impressions: Math.floor(1800 + Math.random() * 6000),
      reach: Math.floor(1500 + Math.random() * 4500),
      engagements: Math.floor(120 + Math.random() * 450),
      clicks: Math.floor(30 + Math.random() * 140),
      saves: Math.floor(15 + Math.random() * 60),
      shares: Math.floor(8 + Math.random() * 35),
      conversions: Math.floor(2 + Math.random() * 12),
    };
  }
}

export const facebookConnector = new FacebookConnector();
