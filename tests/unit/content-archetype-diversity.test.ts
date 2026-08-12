import { describe, it, expect } from 'vitest';
import { contentArchetypeSystem, CONTENT_ARCHETYPES } from '@/lib/ai/content-archetype-system';
import { contentDiversityEvaluator } from '@/lib/ai/content-diversity-evaluator';

describe('Content Archetypes & Diversity Evaluator', () => {
  it('defines 20 distinct content archetypes with structural rules', () => {
    const keys = Object.keys(CONTENT_ARCHETYPES);
    expect(keys.length).toBeGreaterThanOrEqual(20);
    expect(CONTENT_ARCHETYPES.myth_vs_fact.structuralRules).toContain('Debunk');
    expect(CONTENT_ARCHETYPES.checklist.structuralRules).toContain('numbered');
  });

  it('selects content archetypes dynamically based on stage and format', () => {
    const archDecision = contentArchetypeSystem.selectArchetype('decision', 'conversion', 'text_post', 0);
    expect(archDecision.category).toBe('conversion');

    const archCarousel = contentArchetypeSystem.selectArchetype('consideration', 'educational', 'carousel', 0);
    expect(archCarousel.recommendedFormats).toContain('carousel');
  });

  it('evaluates similarity and detects repetitive hooks or body content', () => {
    const post1 = {
      hook: 'Why enterprise decision makers trust ApexAI for autonomous content.',
      bodyText: 'In modern tech, governance is key to scaling multi-agent operations.',
      ctaText: 'Schedule a Demo',
    };

    const post2 = {
      hook: 'Why enterprise decision makers trust ApexAI for autonomous content.',
      bodyText: 'In modern tech, governance is key to scaling multi-agent operations.',
      ctaText: 'Schedule a Demo',
    };

    const result = contentDiversityEvaluator.evaluateDiversity(post2, [post1]);

    expect(result.diversityScore).toBeLessThan(0.4);
    expect(result.isDiverse).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('passes diversity check when posts have distinct hooks and structural angles', () => {
    const post1 = {
      hook: 'Relying on single AI prompts is like handing your Twitter key to an intern.',
      bodyText: 'Discover how multi-agent evaluation gates prevent hallucinated claims.',
      ctaText: 'Register for Demo',
    };

    const post2 = {
      hook: '5 Checkpoints Before Publishing Corporate Social Content in 2026',
      bodyText: 'Follow this actionable checklist: 1. Verify facts, 2. Check tone, 3. Review disclaimers.',
      ctaText: 'Download PDF Checklist',
    };

    const result = contentDiversityEvaluator.evaluateDiversity(post2, [post1]);

    expect(result.diversityScore).toBeGreaterThan(0.65);
    expect(result.isDiverse).toBe(true);
  });
});
