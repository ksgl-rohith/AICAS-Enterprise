export interface ConnectionResult {
  success: boolean;
  accountName?: string;
  accountId?: string;
  organizationId?: string;
  scopes?: string[];
  error?: string;
}

export interface PublishRequest {
  publicationId: string;
  brandId: string;
  channel: 'linkedin' | 'facebook' | 'instagram' | 'telegram';
  headline?: string;
  hook: string;
  bodyText: string;
  ctaText: string;
  hashtags?: string[];
  altText?: string;
  imageUrl?: string;
  isScheduled?: boolean;
  idempotencyKey: string;
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  permalink?: string;
  error?: string;
  isSimulated: boolean;
  publishedAt: Date;
}

export interface PlatformMetrics {
  impressions: number;
  reach: number;
  engagements: number;
  clicks: number;
  saves: number;
  shares: number;
  conversions: number;
}

export interface SocialConnector {
  platform: 'linkedin' | 'facebook' | 'instagram' | 'telegram' | 'simulated';
  isConfigured(brandId: string): Promise<boolean>;
  testConnection(brandId: string): Promise<ConnectionResult>;
  publish(request: PublishRequest): Promise<PublishResult>;
  fetchMetrics?(externalPostId: string): Promise<PlatformMetrics | null>;
}
