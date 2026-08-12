export type PlatformId =
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'threads'
  | 'tiktok'
  | 'youtube'
  | 'telegram'
  | 'pinterest'
  | 'reddit'
  | 'wordpress'
  | 'website';

export type IntegrationGroup = 'Social Publishing' | 'Video' | 'Messaging' | 'Discovery & Community' | 'Owned Media';

export type ConnectorStatus =
  | 'AVAILABLE'
  | 'BETA'
  | 'CONFIGURATION_REQUIRED'
  | 'API_APPROVAL_REQUIRED'
  | 'EXPORT_ONLY'
  | 'NOT_IMPLEMENTED';

export interface ConnectorCapability {
  platform: PlatformId;
  name: string;
  group: IntegrationGroup;
  authenticationType: 'oauth2' | 'bot_token' | 'api_key' | 'webhook';
  publishing: boolean;
  analytics: boolean;
  mediaUpload: boolean;
  videoUpload: boolean;
  carousel: boolean;
  comments: boolean;
  accountDiscovery: boolean;
  scheduling: boolean;
  status: ConnectorStatus;
  description: string;
}

export const CONNECTOR_CAPABILITIES: Record<PlatformId, ConnectorCapability> = {
  linkedin: {
    platform: 'linkedin',
    name: 'LinkedIn',
    group: 'Social Publishing',
    authenticationType: 'oauth2',
    publishing: true,
    analytics: true,
    mediaUpload: true,
    videoUpload: true,
    carousel: true,
    comments: true,
    accountDiscovery: true,
    scheduling: true,
    status: 'AVAILABLE',
    description: 'Enterprise LinkedIn page and profile publishing, document carousels, and engagement metrics.',
  },
  facebook: {
    platform: 'facebook',
    name: 'Facebook Pages',
    group: 'Social Publishing',
    authenticationType: 'oauth2',
    publishing: true,
    analytics: true,
    mediaUpload: true,
    videoUpload: true,
    carousel: true,
    comments: true,
    accountDiscovery: true,
    scheduling: true,
    status: 'AVAILABLE',
    description: 'Facebook Page publishing, image/video posts, link previews, and page analytics.',
  },
  instagram: {
    platform: 'instagram',
    name: 'Instagram Business',
    group: 'Social Publishing',
    authenticationType: 'oauth2',
    publishing: true,
    analytics: true,
    mediaUpload: true,
    videoUpload: true,
    carousel: true,
    comments: true,
    accountDiscovery: true,
    scheduling: true,
    status: 'AVAILABLE',
    description: 'Instagram Business feed, carousel slide decks, reels publishing, and audience metrics.',
  },
  x: {
    platform: 'x',
    name: 'X (Twitter)',
    group: 'Social Publishing',
    authenticationType: 'oauth2',
    publishing: true,
    analytics: true,
    mediaUpload: true,
    videoUpload: false,
    carousel: false,
    comments: true,
    accountDiscovery: true,
    scheduling: true,
    status: 'BETA',
    description: 'X API v2 thread posts, media attachments, and engagement tracking.',
  },
  threads: {
    platform: 'threads',
    name: 'Meta Threads',
    group: 'Social Publishing',
    authenticationType: 'oauth2',
    publishing: true,
    analytics: false,
    mediaUpload: true,
    videoUpload: false,
    carousel: true,
    comments: false,
    accountDiscovery: true,
    scheduling: true,
    status: 'BETA',
    description: 'Threads API publishing for text updates and multi-image posts.',
  },
  tiktok: {
    platform: 'tiktok',
    name: 'TikTok for Business',
    group: 'Social Publishing',
    authenticationType: 'oauth2',
    publishing: false,
    analytics: false,
    mediaUpload: false,
    videoUpload: true,
    carousel: false,
    comments: false,
    accountDiscovery: false,
    scheduling: false,
    status: 'API_APPROVAL_REQUIRED',
    description: 'Direct TikTok video publishing requires Meta/TikTok app review approval.',
  },
  youtube: {
    platform: 'youtube',
    name: 'YouTube & Shorts',
    group: 'Video',
    authenticationType: 'oauth2',
    publishing: true,
    analytics: true,
    mediaUpload: false,
    videoUpload: true,
    carousel: false,
    comments: true,
    accountDiscovery: true,
    scheduling: true,
    status: 'BETA',
    description: 'YouTube Data API v3 video and Shorts upload with automated tags.',
  },
  telegram: {
    platform: 'telegram',
    name: 'Telegram Channel Bot',
    group: 'Messaging',
    authenticationType: 'bot_token',
    publishing: true,
    analytics: false,
    mediaUpload: true,
    videoUpload: true,
    carousel: false,
    comments: false,
    accountDiscovery: true,
    scheduling: true,
    status: 'AVAILABLE',
    description: 'Telegram Bot API instant broadcasts to VIP developer and client channels.',
  },
  pinterest: {
    platform: 'pinterest',
    name: 'Pinterest',
    group: 'Discovery & Community',
    authenticationType: 'oauth2',
    publishing: true,
    analytics: true,
    mediaUpload: true,
    videoUpload: false,
    carousel: false,
    comments: false,
    accountDiscovery: true,
    scheduling: true,
    status: 'BETA',
    description: 'Pinterest pin creation and visual link discovery.',
  },
  reddit: {
    platform: 'reddit',
    name: 'Reddit API',
    group: 'Discovery & Community',
    authenticationType: 'oauth2',
    publishing: false,
    analytics: false,
    mediaUpload: false,
    videoUpload: false,
    carousel: false,
    comments: true,
    accountDiscovery: false,
    scheduling: false,
    status: 'API_APPROVAL_REQUIRED',
    description: 'Subreddit discussion monitoring and compliance-restricted post export.',
  },
  wordpress: {
    platform: 'wordpress',
    name: 'WordPress CMS',
    group: 'Owned Media',
    authenticationType: 'api_key',
    publishing: true,
    analytics: false,
    mediaUpload: true,
    videoUpload: false,
    carousel: false,
    comments: false,
    accountDiscovery: false,
    scheduling: true,
    status: 'EXPORT_ONLY',
    description: 'REST API article draft publishing and blog post export.',
  },
  website: {
    platform: 'website',
    name: 'Corporate Website Webhook',
    group: 'Owned Media',
    authenticationType: 'webhook',
    publishing: true,
    analytics: false,
    mediaUpload: true,
    videoUpload: false,
    carousel: false,
    comments: false,
    accountDiscovery: false,
    scheduling: true,
    status: 'AVAILABLE',
    description: 'Automated JSON payload push to custom corporate website CMS endpoints.',
  },
};

export class ConnectorCapabilityRegistry {
  public getAllCapabilities(): ConnectorCapability[] {
    return Object.values(CONNECTOR_CAPABILITIES);
  }

  public getCapabilitiesByGroup(group: IntegrationGroup): ConnectorCapability[] {
    return Object.values(CONNECTOR_CAPABILITIES).filter((c) => c.group === group);
  }

  public getCapability(platform: PlatformId): ConnectorCapability | undefined {
    return CONNECTOR_CAPABILITIES[platform];
  }
}

export const connectorCapabilityRegistry = new ConnectorCapabilityRegistry();
