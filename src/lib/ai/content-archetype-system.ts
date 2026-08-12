export type ContentArchetypeId =
  | 'educational_explainer'
  | 'myth_vs_fact'
  | 'faq'
  | 'checklist'
  | 'story_narrative'
  | 'case_insight'
  | 'thought_leadership'
  | 'trend_reaction'
  | 'problem_solution'
  | 'comparison'
  | 'data_insight'
  | 'announcement'
  | 'guide'
  | 'carousel_walkthrough'
  | 'awareness_post'
  | 'community_question'
  | 'short_form_educational'
  | 'conversion_focused'
  | 'evergreen_resource'
  | 'industry_deep_dive';

export interface ContentArchetypeDefinition {
  id: ContentArchetypeId;
  name: string;
  category: 'educational' | 'narrative' | 'reactive' | 'conversion' | 'evergreen';
  structuralRules: string;
  openingStyle: string;
  ctaPattern: string;
  recommendedFormats: string[];
}

export const CONTENT_ARCHETYPES: Record<ContentArchetypeId, ContentArchetypeDefinition> = {
  educational_explainer: {
    id: 'educational_explainer',
    name: 'Educational Explainer',
    category: 'educational',
    structuralRules: 'State core concept clearly -> Break down 3 essential components with rationale -> Provide practical takeaway.',
    openingStyle: 'Direct concept definition or thought-provoking industry question.',
    ctaPattern: 'Educational whitepaper or deep-dive guide download.',
    recommendedFormats: ['text_post', 'carousel'],
  },
  myth_vs_fact: {
    id: 'myth_vs_fact',
    name: 'Myth vs. Fact',
    category: 'educational',
    structuralRules: 'Identify 1 widespread industry myth -> Debunk with verified evidence -> Present grounded fact -> Call to action.',
    openingStyle: 'Contrarian statement highlighting a common myth.',
    ctaPattern: 'Consultation or expert audit request.',
    recommendedFormats: ['text_post', 'image_post'],
  },
  faq: {
    id: 'faq',
    name: 'Frequently Asked Questions (FAQ)',
    category: 'educational',
    structuralRules: 'List top 2-3 client/audience questions -> Direct concise expert answers with disclaimers -> Consultation CTA.',
    openingStyle: 'Addressing the most common question received from clients.',
    ctaPattern: 'Ask a question or request legal/technical advisory.',
    recommendedFormats: ['text_post', 'carousel'],
  },
  checklist: {
    id: 'checklist',
    name: 'Actionable Checklist',
    category: 'educational',
    structuralRules: 'Set context -> Provide 4-5 numbered bullet points with action verbs -> Summary CTA.',
    openingStyle: 'Action-oriented headline (e.g., "5 Checkpoints Before Launching...").',
    ctaPattern: 'Save post or download complete checklist template.',
    recommendedFormats: ['carousel', 'text_post'],
  },
  story_narrative: {
    id: 'story_narrative',
    name: 'Story & Case Narrative',
    category: 'narrative',
    structuralRules: 'Describe initial challenge/situation -> Strategic pivot -> Quantifiable outcome achieved.',
    openingStyle: 'Narrative hook starting in media res or with an unexpected challenge.',
    ctaPattern: 'Read complete case study.',
    recommendedFormats: ['text_post'],
  },
  case_insight: {
    id: 'case_insight',
    name: 'Case-Style Insight',
    category: 'narrative',
    structuralRules: 'Enterprise client scenario -> Grounded analysis -> Replicable lessons learned.',
    openingStyle: 'Quantifiable result achieved by a client or industry benchmark.',
    ctaPattern: 'Explore client success stories.',
    recommendedFormats: ['text_post', 'image_post'],
  },
  thought_leadership: {
    id: 'thought_leadership',
    name: 'Opinion & Thought Leadership',
    category: 'narrative',
    structuralRules: 'Executive perspective on industry shift -> Strategic implications -> Call for industry standard.',
    openingStyle: 'Forward-looking industry prediction or strategic viewpoint.',
    ctaPattern: 'Share perspective or join executive webinar.',
    recommendedFormats: ['text_post'],
  },
  trend_reaction: {
    id: 'trend_reaction',
    name: 'Trend Reaction & Commentary',
    category: 'reactive',
    structuralRules: 'Highlight recent market signal -> Analyze brand impact -> Actionable guidance.',
    openingStyle: 'Breaking market trend or signal summary.',
    ctaPattern: 'Subscribe for ongoing market intelligence updates.',
    recommendedFormats: ['text_post', 'image_post'],
  },
  problem_solution: {
    id: 'problem_solution',
    name: 'Problem / Solution Breakdown',
    category: 'conversion',
    structuralRules: 'Diagnose critical pain point -> Demonstrate core solution -> Direct offer CTA.',
    openingStyle: 'Empathic pain-point statement.',
    ctaPattern: 'Book demo or schedule consultation.',
    recommendedFormats: ['text_post', 'carousel'],
  },
  comparison: {
    id: 'comparison',
    name: 'Strategic Comparison',
    category: 'educational',
    structuralRules: 'Compare Approach A vs Approach B -> Evaluate pros, cons, and compliance -> Recommendation.',
    openingStyle: 'A vs B comparison query.',
    ctaPattern: 'Request custom evaluation.',
    recommendedFormats: ['carousel', 'image_post'],
  },
  data_insight: {
    id: 'data_insight',
    name: 'Data & Benchmark Insight',
    category: 'educational',
    structuralRules: 'Present statistical data point -> Explain underlying cause -> Strategic recommendation.',
    openingStyle: 'Eye-opening statistic or benchmark data point.',
    ctaPattern: 'Download full benchmark report.',
    recommendedFormats: ['image_post', 'carousel'],
  },
  announcement: {
    id: 'announcement',
    name: 'Official Announcement',
    category: 'conversion',
    structuralRules: 'Headline event/release -> Key features & value -> Instant action link.',
    openingStyle: 'Exciting announcement or release notice.',
    ctaPattern: 'Register or try now.',
    recommendedFormats: ['text_post', 'image_post'],
  },
  guide: {
    id: 'guide',
    name: 'Step-by-Step Guide',
    category: 'evergreen',
    structuralRules: 'Phase 1 Preparation -> Phase 2 Execution -> Phase 3 Verification.',
    openingStyle: 'Definitive guide title.',
    ctaPattern: 'Download comprehensive guide.',
    recommendedFormats: ['carousel', 'text_post'],
  },
  carousel_walkthrough: {
    id: 'carousel_walkthrough',
    name: 'Visual Carousel Walkthrough',
    category: 'evergreen',
    structuralRules: 'Slide 1 Hook -> Slides 2-4 Deep-dive steps -> Slide 5 CTA & Summary.',
    openingStyle: 'Visual hook slide with high contrast typography.',
    ctaPattern: 'Swipe to end & click bio link.',
    recommendedFormats: ['carousel'],
  },
  awareness_post: {
    id: 'awareness_post',
    name: 'Brand Awareness Highlight',
    category: 'evergreen',
    structuralRules: 'Core mission statement -> Differentiating values -> Community engagement.',
    openingStyle: 'Inspiring brand philosophy statement.',
    ctaPattern: 'Follow brand or learn more about mission.',
    recommendedFormats: ['text_post', 'image_post'],
  },
  community_question: {
    id: 'community_question',
    name: 'Community & Peer Discussion',
    category: 'narrative',
    structuralRules: 'Introduce industry debate topic -> Share 2 perspective angles -> Prompt audience comments.',
    openingStyle: 'Engaging open question to practitioners.',
    ctaPattern: 'Comment your thoughts below.',
    recommendedFormats: ['text_post'],
  },
  short_form_educational: {
    id: 'short_form_educational',
    name: 'Short-Form Quick Takeaway',
    category: 'educational',
    structuralRules: '1-sentence core tip -> 3 short bullet points -> Fast CTA.',
    openingStyle: 'Punchy 1-sentence tip.',
    ctaPattern: 'Save for later.',
    recommendedFormats: ['text_post'],
  },
  conversion_focused: {
    id: 'conversion_focused',
    name: 'High-Intent Conversion Post',
    category: 'conversion',
    structuralRules: 'Value proposition -> Offer details -> Urgency factor -> Direct action link.',
    openingStyle: 'Direct value proposition statement.',
    ctaPattern: 'Schedule consultation / Book demo immediately.',
    recommendedFormats: ['text_post', 'image_post'],
  },
  evergreen_resource: {
    id: 'evergreen_resource',
    name: 'Evergreen Knowledge Pillar',
    category: 'evergreen',
    structuralRules: 'Timeless industry principle -> Methodical explanation -> Permanent reference CTA.',
    openingStyle: 'Timeless principle assertion.',
    ctaPattern: 'Bookmark & reference anytime.',
    recommendedFormats: ['text_post', 'carousel'],
  },
  industry_deep_dive: {
    id: 'industry_deep_dive',
    name: 'Industry Deep Dive',
    category: 'educational',
    structuralRules: 'Regulatory/market context -> Deep analysis of 3 core factors -> Strategic summary.',
    openingStyle: 'In-depth industry analysis statement.',
    ctaPattern: 'Contact legal counsel or enterprise advisory team.',
    recommendedFormats: ['text_post', 'carousel'],
  },
};

export class ContentArchetypeSystem {
  public selectArchetype(
    stage: 'awareness' | 'consideration' | 'decision' | 'retention',
    category: 'evergreen' | 'campaign' | 'educational' | 'conversion' | 'reactive',
    format: 'text_post' | 'image_post' | 'carousel' | 'video_script',
    index: number
  ): ContentArchetypeDefinition {
    const list = Object.values(CONTENT_ARCHETYPES).filter((arch) => {
      if (category === 'reactive') return arch.category === 'reactive' || arch.id === 'trend_reaction';
      if (category === 'conversion' || stage === 'decision') return arch.category === 'conversion' || arch.id === 'problem_solution';
      if (format === 'carousel') return arch.recommendedFormats.includes('carousel');
      return true;
    });

    const chosen = list[index % list.length] || CONTENT_ARCHETYPES.educational_explainer;
    return chosen;
  }
}

export const contentArchetypeSystem = new ContentArchetypeSystem();
