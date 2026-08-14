export interface RepetitionCheckInput {
  newContentText: string;
  hookText: string;
  ctaText: string;
  existingPostsText: string[];
}

export interface RepetitionCheckResult {
  passed: boolean;
  maxSimilarity: number;
  flaggedPhrases: string[];
  recommendation?: string;
}

const CLICHE_PHRASES = [
  "in today's fast-paced world",
  "in today's evolving landscape",
  "did you know?",
  "unlock the power of",
  "take your business to the next level",
  "game-changer",
  "cutting-edge solution",
  "seamless integration",
  "paradigm shift",
  "revolutionary approach",
];

export class RepetitionChecker {
  /**
   * Calculate Jaccard similarity coefficient between two word sets.
   */
  public calculateJaccardSimilarity(textA: string, textB: string): number {
    const wordsA = new Set(textA.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
    const wordsB = new Set(textB.toLowerCase().split(/\W+/).filter((w) => w.length > 3));

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }

    const union = wordsA.size + wordsB.size - intersection;
    return intersection / union;
  }

  /**
   * Detect prohibited generic AI clichés.
   */
  public findCliches(text: string): string[] {
    const lower = text.toLowerCase();
    return CLICHE_PHRASES.filter((cliche) => lower.includes(cliche));
  }

  /**
   * Evaluate repetition against existing drafts and posts.
   */
  public checkRepetition(input: RepetitionCheckInput): RepetitionCheckResult {
    const clichesFound = this.findCliches(input.newContentText);

    let maxSimilarity = 0;
    for (const existing of input.existingPostsText) {
      const sim = this.calculateJaccardSimilarity(input.newContentText, existing);
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
      }
    }

    const failedCliches = clichesFound.length > 0;
    const failedSimilarity = maxSimilarity > 0.65;

    const passed = !failedCliches && !failedSimilarity;
    const flaggedPhrases = [...clichesFound];

    let recommendation: string | undefined;
    if (failedCliches) {
      recommendation = `Remove generic clichés: ${clichesFound.join(', ')}. Rewrite with direct, brand-specific evidence.`;
    } else if (failedSimilarity) {
      recommendation = `High structural similarity (${(maxSimilarity * 100).toFixed(1)}%) detected with prior posts. Switch content archetype or opening hook.`;
    }

    return {
      passed,
      maxSimilarity,
      flaggedPhrases,
      recommendation,
    };
  }
}

export const repetitionChecker = new RepetitionChecker();
