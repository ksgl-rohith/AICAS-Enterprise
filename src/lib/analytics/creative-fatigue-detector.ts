import { db } from '@/lib/db';

export interface ContentItemForFatigueCheck {
  id: string;
  brandId: string;
  channel: string;
  hook: string;
  bodyText: string;
  ctaText: string;
  visualConcept?: string;
  topic?: string;
  createdAt: Date | string;
}

export interface FatigueCheckResult {
  hasFatigue: boolean;
  score: number; // 0.0 - 1.0 similarity / fatigue score
  fatigueTypes: string[];
  explanation: string;
  details: {
    hookSimilarity: number;
    captionSimilarity: number;
    ctaOveruseCount: number;
    topicFrequencyCount: number;
    channelOverpostingCount: number;
  };
}

export class CreativeFatigueDetector {
  private static instance: CreativeFatigueDetector;

  private constructor() {}

  public static getInstance(): CreativeFatigueDetector {
    if (!CreativeFatigueDetector.instance) {
      CreativeFatigueDetector.instance = new CreativeFatigueDetector();
    }
    return CreativeFatigueDetector.instance;
  }

  /**
   * Deterministic Lev-distance / Jaccard n-gram similarity string comparison
   */
  public computeStringSimilarity(str1: string, str2: string): number {
    const s1 = (str1 || '').toLowerCase().trim();
    const s2 = (str2 || '').toLowerCase().trim();
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const set1 = new Set(s1.split(/\s+/));
    const set2 = new Set(s2.split(/\s+/));
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  public async checkFatigue(
    tenantId: string,
    newItem: ContentItemForFatigueCheck
  ): Promise<FatigueCheckResult> {
    // 1. Fetch recent content variants for this brand in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentItems = await db.contentItem.findMany({
      where: {
        campaign: { brandId: newItem.brandId },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        variants: true,
      },
      take: 50,
    });

    const fatigueTypes: string[] = [];
    let maxHookSim = 0;
    let maxCaptionSim = 0;
    let ctaCount = 0;
    let topicCount = 0;
    let sameDayChannelCount = 0;

    const newHook = newItem.hook.toLowerCase();
    const newBody = newItem.bodyText.toLowerCase();
    const newCTA = newItem.ctaText.toLowerCase();
    const newTopic = (newItem.topic || '').toLowerCase();
    const itemDate = new Date(newItem.createdAt).toDateString();

    for (const item of recentItems) {
      if (item.id === newItem.id) continue;
      if (itemDate === new Date(item.createdAt).toDateString()) {
        sameDayChannelCount++;
      }

      for (const variant of item.variants) {
        if (variant.channel !== newItem.channel) continue;

        // Check hook similarity
        const hookSim = this.computeStringSimilarity(newHook, variant.hook);
        if (hookSim > maxHookSim) maxHookSim = hookSim;

        // Check caption similarity
        const captionSim = this.computeStringSimilarity(newBody, variant.bodyText);
        if (captionSim > maxCaptionSim) maxCaptionSim = captionSim;

        // Check CTA overuse
        if (variant.ctaText && this.computeStringSimilarity(newCTA, variant.ctaText) > 0.8) {
          ctaCount++;
        }
      }

      if (newTopic && item.title.toLowerCase().includes(newTopic)) {
        topicCount++;
      }
    }

    if (maxHookSim >= 0.75) fatigueTypes.push('REPEATED_HOOK');
    if (maxCaptionSim >= 0.80) fatigueTypes.push('NEAR_DUPLICATE_CAPTION');
    if (ctaCount >= 5) fatigueTypes.push('OVERUSED_CTA');
    if (topicCount >= 6) fatigueTypes.push('EXCESSIVE_TOPIC_FREQ');
    if (sameDayChannelCount >= 4) fatigueTypes.push('CHANNEL_OVERPOSTING');

    const highestScore = Math.max(maxHookSim, maxCaptionSim);
    const hasFatigue = fatigueTypes.length > 0;

    const explanation = hasFatigue
      ? `Creative fatigue detected: ${fatigueTypes.join(', ')}. Max hook similarity: ${(maxHookSim * 100).toFixed(0)}%, max caption similarity: ${(maxCaptionSim * 100).toFixed(0)}%.`
      : 'No creative fatigue or content decay detected.';

    // Store explainable fatigue record if detected
    if (hasFatigue) {
      for (const fType of fatigueTypes) {
        await db.creativeFatigueRecord.create({
          data: {
            tenantId,
            brandId: newItem.brandId,
            contentId: newItem.id,
            fatigueType: fType,
            similarityScore: highestScore,
            explanation,
          },
        });
      }
    }

    return {
      hasFatigue,
      score: highestScore,
      fatigueTypes,
      explanation,
      details: {
        hookSimilarity: maxHookSim,
        captionSimilarity: maxCaptionSim,
        ctaOveruseCount: ctaCount,
        topicFrequencyCount: topicCount,
        channelOverpostingCount: sameDayChannelCount,
      },
    };
  }
}

export const creativeFatigueDetector = CreativeFatigueDetector.getInstance();
