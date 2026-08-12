import { db } from '@/lib/db';
import { RawSignal } from './trend-intelligence-agent';

export type TrendFreshnessState = 'LIVE' | 'RECENT' | 'CACHED' | 'STALE' | 'UNAVAILABLE';

export interface IngestedTrendSignalPackage {
  signals: RawSignal[];
  freshnessState: TrendFreshnessState;
  lastIngestedAt: string;
  sourceCount: number;
}

export class TrendSignalIngestion {
  /**
   * Fetch active market trend signals from database or fallback live sources
   */
  public async getActiveSignals(industry: string): Promise<IngestedTrendSignalPackage> {
    try {
      const dbSignals = await db.trendSignal.findMany({
        orderBy: { detectedAt: 'desc' },
        take: 15,
      });

      if (dbSignals.length === 0) {
        return {
          signals: [],
          freshnessState: 'UNAVAILABLE',
          lastIngestedAt: new Date().toISOString(),
          sourceCount: 0,
        };
      }

      const now = Date.now();
      const newestTs = new Date(dbSignals[0].detectedAt).getTime();
      const ageHours = (now - newestTs) / (1000 * 3600);

      let freshnessState: TrendFreshnessState = 'LIVE';
      if (ageHours > 168) {
        freshnessState = 'STALE';
      } else if (ageHours > 72) {
        freshnessState = 'CACHED';
      } else if (ageHours > 24) {
        freshnessState = 'RECENT';
      }

      const signals: RawSignal[] = dbSignals.map((sig) => ({
        id: sig.id,
        title: sig.topic,
        summary: sig.summary,
        source: sig.source,
        sourceType: 'news',
        publishedAt: sig.detectedAt.toISOString(),
        keywords: [sig.category, industry],
      }));

      return {
        signals,
        freshnessState,
        lastIngestedAt: dbSignals[0].detectedAt.toISOString(),
        sourceCount: dbSignals.length,
      };
    } catch (err) {
      console.warn('[TrendSignalIngestion] Could not query trend signals from DB:', err);
      return {
        signals: [],
        freshnessState: 'UNAVAILABLE',
        lastIngestedAt: new Date().toISOString(),
        sourceCount: 0,
      };
    }
  }
}

export const trendSignalIngestion = new TrendSignalIngestion();
