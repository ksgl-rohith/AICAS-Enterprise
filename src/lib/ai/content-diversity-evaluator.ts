export interface DiversityEvaluationResult {
  semanticSimilarity: number;
  hookSimilarity: number;
  ctaSimilarity: number;
  structuralSimilarity: number;
  diversityScore: number; // 0.0 to 1.0 (higher = more diverse)
  isDiverse: boolean;
  warnings: string[];
}

export class ContentDiversityEvaluator {
  /**
   * Calculate Jaccard similarity between two strings
   */
  private calculateJaccardSimilarity(textA: string, textB: string): number {
    const wordsA = new Set(textA.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3));
    const wordsB = new Set(textB.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3));

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let intersection = 0;
    wordsA.forEach((word) => {
      if (wordsB.has(word)) intersection++;
    });

    const union = wordsA.size + wordsB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Evaluate diversity between a newly proposed post and recent campaign posts
   */
  public evaluateDiversity(
    newPost: { hook: string; bodyText: string; ctaText: string },
    existingPosts: Array<{ hook: string; bodyText: string; ctaText: string }>
  ): DiversityEvaluationResult {
    if (!existingPosts || existingPosts.length === 0) {
      return {
        semanticSimilarity: 0,
        hookSimilarity: 0,
        ctaSimilarity: 0,
        structuralSimilarity: 0,
        diversityScore: 1.0,
        isDiverse: true,
        warnings: [],
      };
    }

    let maxHookSim = 0;
    let maxBodySim = 0;
    let maxCtaSim = 0;

    for (const post of existingPosts) {
      const hookSim = this.calculateJaccardSimilarity(newPost.hook, post.hook);
      const bodySim = this.calculateJaccardSimilarity(newPost.bodyText, post.bodyText);
      const ctaSim = this.calculateJaccardSimilarity(newPost.ctaText, post.ctaText);

      if (hookSim > maxHookSim) maxHookSim = hookSim;
      if (bodySim > maxBodySim) maxBodySim = bodySim;
      if (ctaSim > maxCtaSim) maxCtaSim = ctaSim;
    }

    const avgSimilarity = (maxHookSim * 0.4) + (maxBodySim * 0.4) + (maxCtaSim * 0.2);
    const diversityScore = Math.max(0, Math.min(1.0, 1.0 - avgSimilarity));
    const isDiverse = diversityScore >= 0.65;

    const warnings: string[] = [];
    if (maxHookSim > 0.6) {
      warnings.push(`Hook similarity is high (${(maxHookSim * 100).toFixed(0)}%). Try a different opening archetype.`);
    }
    if (maxBodySim > 0.6) {
      warnings.push(`Body content similarity is high (${(maxBodySim * 100).toFixed(0)}%). Ensure distinct value angles.`);
    }

    return {
      semanticSimilarity: Math.round(maxBodySim * 100) / 100,
      hookSimilarity: Math.round(maxHookSim * 100) / 100,
      ctaSimilarity: Math.round(maxCtaSim * 100) / 100,
      structuralSimilarity: Math.round(avgSimilarity * 100) / 100,
      diversityScore: Math.round(diversityScore * 100) / 100,
      isDiverse,
      warnings,
    };
  }
}

export const contentDiversityEvaluator = new ContentDiversityEvaluator();
