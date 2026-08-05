import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AICAS Lite database...');

  // 1. Create Demo User
  const user = await prisma.user.upsert({
    where: { email: 'demo@aicas.ai' },
    update: {},
    create: {
      email: 'demo@aicas.ai',
      name: 'Alex Vance',
      role: 'MARKETING_MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  console.log('Created user:', user.email);

  // 2. Create Brand
  const brand = await prisma.brand.create({
    data: {
      userId: user.id,
      name: 'ApexAI Solutions',
      industry: 'Enterprise Software & AI',
      description: 'ApexAI provides enterprise-grade autonomous AI workflows, multi-agent orchestration, and governance for Fortune 500 organizations.',
      products: 'Apex Workflow Engine, Apex Brand DNA Guardian, Apex Multi-Agent Studio',
      targetAudience: 'CTOs, Chief Digital Officers, VPs of Marketing, Enterprise IT Leaders',
      personality: 'Authoritative, Innovative, Visionary, Rigorous, Governance-focused',
      tone: 'Professional, confident, clear, evidence-backed',
      preferredVocabulary: 'Autonomous AI, Multi-Agent Orchestration, Governance, ROI, Enterprise Scale, Brand Safety',
      prohibitedPhrases: 'Guaranteed 1000% ROI, Magic AI, Zero Effort, Instant Wealth, Hallucination-free guaranteed',
      requiredDisclaimers: 'Results may vary based on enterprise architecture and data governance readiness.',
      defaultCTA: 'Schedule an Enterprise AI Governance Workshop',
      region: 'North America & Europe',
      language: 'en-US',
      brandColors: '#4f46e5,#06b6d4',
      competitors: 'DataRobot, C3.ai, Palantir Foundry',
    },
  });

  console.log('Created brand:', brand.name);

  // 3. Create Brand Knowledge Documents & Chunks
  const doc1 = await prisma.brandKnowledgeDocument.create({
    data: {
      brandId: brand.id,
      filename: 'ApexAI_Whitepaper_2026.pdf',
      fileType: 'pdf',
      fileSize: 452000,
      extractedText: 'ApexAI Enterprise Architecture delivers 4x increase in content production velocity while maintaining 99.8% compliance with corporate brand policies. Autonomous multi-agent coordination ensures deterministic review gates prior to publication.',
      charCount: 245,
      chunkCount: 2,
      status: 'PROCESSED',
    },
  });

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        documentId: doc1.id,
        brandId: brand.id,
        chunkIndex: 0,
        content: 'ApexAI Enterprise Architecture delivers 4x increase in content production velocity while maintaining 99.8% compliance with corporate brand policies.',
        charCount: 153,
      },
      {
        documentId: doc1.id,
        brandId: brand.id,
        chunkIndex: 1,
        content: 'Autonomous multi-agent coordination ensures deterministic review gates prior to publication, preventing hallucinated claims and unauthorized messaging.',
        charCount: 161,
      },
    ],
  });

  // 4. Create Trend Signals
  await prisma.trendSignal.createMany({
    data: [
      {
        topic: 'Autonomous Multi-Agent AI in Enterprise SaaS',
        category: 'AI & Machine Learning',
        summary: 'Gartner reports a 300% increase in enterprise interest in multi-agent orchestration for digital operations.',
        source: 'GDELT & Tech Trends 2026',
        relevanceScore: 0.95,
        freshnessScore: 0.98,
        opportunityScore: 0.93,
      },
      {
        topic: 'AI Brand Safety & Compliance Guardrails',
        category: 'Corporate Governance',
        summary: 'Regulatory frameworks in US and EU now require strict provenance and oversight for automated corporate communications.',
        source: 'Industry Regulation Ingestion',
        relevanceScore: 0.92,
        freshnessScore: 0.91,
        opportunityScore: 0.89,
      },
      {
        topic: 'B2B LinkedIn Thought Leadership Shift',
        category: 'Social Media Strategy',
        summary: 'Data-backed carousel posts on LinkedIn generate 3.4x higher engagement than plain text updates.',
        source: 'Social Intelligence Signals',
        relevanceScore: 0.88,
        freshnessScore: 0.85,
        opportunityScore: 0.87,
      },
    ],
  });

  // 5. Create Sample Campaign
  const campaign = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      name: 'Q3 Enterprise Multi-Agent Summit',
      objective: 'webinar_registrations',
      productOrTopic: 'Autonomous Multi-Agent Content Operations for Enterprise',
      description: 'Global campaign positioning ApexAI as the leader in governed, multi-agent content generation and publishing.',
      targetAudience: 'Chief Marketing Officers, VPs of Communications, Enterprise AI Architects',
      offerCTA: 'Register for the Live Multi-Agent Architecture Demo',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-25'),
      channels: 'linkedin,facebook,instagram,telegram',
      region: 'en-US',
      language: 'en-US',
      textPostCount: 4,
      imageBriefCount: 2,
      carouselCount: 1,
      postingFrequency: 'daily',
      requiredMessages: 'Highlight multi-agent governance, brand safety, and measurable ROI.',
      prohibitedThemes: 'No political commentary or unverified claims.',
      groundingRequired: true,
      approvalRequired: true,
      status: 'APPROVED',
    },
  });

  // Campaign Strategy
  await prisma.campaignStrategy.create({
    data: {
      campaignId: campaign.id,
      objectiveInterpretation: 'Drive high-intent enterprise registrations for the Q3 Multi-Agent Summit by building trust around governance and brand safety.',
      audienceSummary: 'Enterprise decision-makers concerned about brand risk, hallucination, and scaling social media output across global teams.',
      campaignNarrative: 'From Fragmented Manual Posting to Governed Autonomous Multi-Agent Operations.',
      contentPillarsJson: JSON.stringify([
        { name: 'Multi-Agent Governance', angle: 'Why single LLM prompts fail enterprise safety tests', rationale: 'Addresses core enterprise hesitation around AI automation' },
        { name: 'ROI & Speed', angle: 'Scaling content 4x without expanding team headcount', rationale: 'Appeals to efficiency-focused CMOs' },
        { name: 'Brand Safety & Grounding', angle: 'Eliminating hallucinations with RAG and deterministic gates', rationale: 'Crucial for corporate compliance' },
      ]),
      channelRolesJson: JSON.stringify({
        linkedin: 'Long-form thought leadership, technical carousels, executive quotes',
        facebook: 'Community discussions, webinar event previews, link previews',
        instagram: 'Visual architecture infographics, slide carousels, short video teasers',
        telegram: 'Direct VIP developer/architect channel updates and quick alerts',
      }),
      publishingCadence: 'LinkedIn: 1 post/day at 09:00 EST. Facebook: 1 post/day at 11:00 EST. Instagram: 1 carousel/2 days at 14:00 EST.',
      contentIdeasJson: JSON.stringify([
        '5 Reasons Single Prompts Break Enterprise Brand Consistency',
        'How Multi-Agent Systems Eliminate AI Hallucinations in Corporate Social Media',
        'Behind the Scenes: ApexAI Autonomous Publishing Pipeline Architecture',
      ]),
      constraintsJson: JSON.stringify([
        'Must include registration CTA',
        'Must display required legal disclaimers',
        'No prohibited phrases',
      ]),
      retrievedEvidenceJson: JSON.stringify([
        { doc: 'ApexAI_Whitepaper_2026.pdf', excerpt: 'ApexAI Enterprise Architecture delivers 4x increase in content production velocity...' },
      ]),
    },
  });

  // Content Item 1: Multi-Agent Governance
  const item1 = await prisma.contentItem.create({
    data: {
      campaignId: campaign.id,
      title: 'How Multi-Agent Systems Eliminate AI Hallucinations in Enterprise Social',
      coreIdea: 'Explains why single LLM prompts hallucinate and how specialized multi-agent evaluation gates enforce strict brand policies.',
      targetAudience: 'VPs of Marketing & Enterprise IT Directors',
      contentPillar: 'Multi-Agent Governance',
      format: 'text_post',
      defaultCTA: 'Register for the Live Multi-Agent Architecture Demo',
      status: 'APPROVED',
    },
  });

  // Variants for Item 1
  const varLinkedin1 = await prisma.contentVariant.create({
    data: {
      contentItemId: item1.id,
      channel: 'linkedin',
      headline: 'The End of AI Hallucinations in Enterprise Social Media',
      hook: 'Relying on a single AI prompt for your corporate brand is like handing your Twitter key to an unsupervised intern.',
      bodyText: `Most enterprises hesitate to automate content generation because single LLMs hallucinate facts, violate brand tone, and miss mandatory disclaimers.

At ApexAI, we solved this by moving from single prompts to a specialized Multi-Agent Quality Council:
- BrandContextAgent injects verified corporate DNA & guidelines.
- CopywritingAgent drafts platform-tailored narrative.
- ReviewAgent validates factual claims against approved enterprise knowledge.

The result? 4x content output velocity with 99.8% compliance.

Join our upcoming live masterclass: "Autonomous Multi-Agent Content Operations for Enterprise".`,
      ctaText: 'Register for the Live Multi-Agent Architecture Demo: https://apexai.solutions/webinar',
      hashtags: '#EnterpriseAI #MultiAgent #BrandSafety #ContentOperations #AI',
      altText: 'Diagram showing Multi-Agent Quality Council workflow',
      evidenceRefsJson: JSON.stringify([
        { chunkId: 'chk_1', text: 'ApexAI Enterprise Architecture delivers 4x increase in content production velocity...' }
      ]),
      status: 'GENERATED',
    },
  });

  const varFacebook1 = await prisma.contentVariant.create({
    data: {
      contentItemId: item1.id,
      channel: 'facebook',
      hook: 'Is your marketing team still manually reviewing every single social post for compliance?',
      bodyText: `Discover how leading enterprise tech teams are automating 80% of their content pipeline while maintaining strict brand safety guardrails.

Learn how ApexAI uses autonomous multi-agent validation to enforce brand tone and legal compliance.

Date: August 15, 2026
Topic: Governed Multi-Agent Content Operations`,
      ctaText: 'Reserve your spot now at https://apexai.solutions/webinar',
      hashtags: '#ApexAI #EnterpriseSoftware #Automation',
      altText: 'ApexAI Webinar Event Cover Banner',
      status: 'GENERATED',
    },
  });

  const varInstagram1 = await prisma.contentVariant.create({
    data: {
      contentItemId: item1.id,
      channel: 'instagram',
      hook: 'Why single AI prompts fail enterprise brand standards',
      bodyText: `Swipe left to see how autonomous multi-agent workflows build bulletproof brand safety for corporate content. 

1. Grounded RAG Knowledge Assembly
2. Multi-Agent Creation & Strategy
3. Deterministic Compliance Review
4. Timezone-Aware Publishing

Register for our upcoming virtual summit via the link in bio!`,
      ctaText: 'Link in Bio to Register',
      hashtags: '#AI #TechTrends #MarketingAutomation #Enterprise',
      altText: 'Slide deck cover explaining multi-agent AI architecture',
      visualConcept: 'Sleek dark mode graphic with glowing indigo node network representing multi-agent orchestration.',
      carouselSlidesJson: JSON.stringify([
        { slideNumber: 1, title: 'The Problem with Single Prompts', content: 'Unpredictable tone & hallucinated claims', visualDirection: 'Red warning node icon' },
        { slideNumber: 2, title: 'The Multi-Agent Solution', content: 'Specialized agents for Brand, Review, and Strategy', visualDirection: 'Connected indigo network nodes' },
        { slideNumber: 3, title: 'Real Results', content: '4x velocity, 99.8% policy compliance', visualDirection: 'Growth chart graphic' },
      ]),
      status: 'GENERATED',
    },
  });

  // Review Result for Item 1
  await prisma.reviewResult.create({
    data: {
      contentItemId: item1.id,
      brandScore: 94,
      factualRiskScore: 12, // low risk
      complianceScore: 98,
      originalityScore: 92,
      readabilityScore: 89,
      overallStatus: 'passed',
      confidence: 0.96,
      warningsJson: JSON.stringify(['Ensure link tracking UTM parameters are appended prior to launch.']),
      evidenceRefsJson: JSON.stringify([
        { chunk: 'ApexAI_Whitepaper_2026.pdf', score: 0.94 }
      ]),
      prohibitedTermsFound: '',
      missingDisclaimers: '',
      duplicateSimilarity: 0.05,
    },
  });

  // Approval for Item 1
  await prisma.approval.create({
    data: {
      contentItemId: item1.id,
      reviewerId: user.id,
      decision: 'APPROVED',
      comment: 'Excellent brand tone and strong CTA for the webinar campaign.',
    },
  });

  // Schedule for Item 1
  const schedule1 = await prisma.schedule.create({
    data: {
      campaignId: campaign.id,
      contentItemId: item1.id,
      channel: 'linkedin',
      scheduledTime: new Date(Date.now() - 3600 * 1000 * 24 * 2), // 2 days ago
      timezone: 'UTC',
      status: 'PUBLISHED',
    },
  });

  // Publication for Item 1
  const pub1 = await prisma.publication.create({
    data: {
      contentItemId: item1.id,
      scheduleId: schedule1.id,
      channel: 'linkedin',
      publishingMode: 'simulated',
      externalPostId: 'sim_lnk_98471203',
      permalink: 'https://linkedin.com/feed/update/urn:li:activity:98471203',
      status: 'SUCCESS',
      idempotencyKey: 'idemp_lnk_item1_v1',
      publishedAt: new Date(Date.now() - 3600 * 1000 * 24 * 2),
    },
  });

  // Publication Attempt
  await prisma.publicationAttempt.create({
    data: {
      publicationId: pub1.id,
      attemptNumber: 1,
      status: 'SUCCESS',
      responsePayloadJson: JSON.stringify({ status: 201, externalId: 'sim_lnk_98471203', timestamp: new Date() }),
    },
  });

  // Metrics Snapshots for pub1
  await prisma.metricsSnapshot.createMany({
    data: [
      {
        publicationId: pub1.id,
        channel: 'linkedin',
        isReal: false,
        impressions: 14200,
        reach: 11800,
        engagements: 890,
        clicks: 342,
        saves: 115,
        shares: 64,
        conversions: 28,
        engagementRate: 6.26,
        snapshotDate: new Date(Date.now() - 3600 * 1000 * 24 * 1),
      },
      {
        publicationId: pub1.id,
        channel: 'linkedin',
        isReal: false,
        impressions: 18900,
        reach: 15400,
        engagements: 1240,
        clicks: 489,
        saves: 168,
        shares: 92,
        conversions: 41,
        engagementRate: 6.56,
        snapshotDate: new Date(),
      },
    ],
  });

  // 6. Recommendation
  await prisma.recommendation.create({
    data: {
      targetChannel: 'linkedin',
      bestPillar: 'Multi-Agent Governance',
      strongestHook: 'Question-based contrast hook ("Is your marketing team still manually reviewing...")',
      recommendedTopic: '5 Governance Checkpoints Before Publishing AI Content in Enterprise',
      postingWindow: 'Tuesdays & Thursdays at 09:00 EST',
      cta: 'Direct Link to Live Architecture Demo',
      explanation: 'Analysis of recent post metrics indicates LinkedIn audiences engage 3.4x more with Multi-Agent Governance topics compared to general AI product updates. Conversion rate is highest at 8.4% when specifying live demo webinars.',
      confidence: 0.94,
      limitations: 'Sample size based on 14 simulated publication cycles across Q2/Q3.',
    },
  });

  // 7. Audit Events
  await prisma.auditEvent.createMany({
    data: [
      {
        userId: user.id,
        brandId: brand.id,
        action: 'BRAND_CREATED',
        details: 'Brand ApexAI Solutions created with tone rules and prohibited phrases.',
        entityType: 'Brand',
        entityId: brand.id,
      },
      {
        userId: user.id,
        brandId: brand.id,
        action: 'DOCUMENT_UPLOADED',
        details: 'Document ApexAI_Whitepaper_2026.pdf ingested and chunked into 2 vector records.',
        entityType: 'BrandKnowledgeDocument',
        entityId: doc1.id,
      },
      {
        userId: user.id,
        brandId: brand.id,
        campaignId: campaign.id,
        action: 'CAMPAIGN_CREATED',
        details: 'Campaign Q3 Enterprise Multi-Agent Summit created.',
        entityType: 'Campaign',
        entityId: campaign.id,
      },
      {
        userId: user.id,
        brandId: brand.id,
        campaignId: campaign.id,
        action: 'STRATEGY_GENERATED',
        details: 'StrategyAgent completed campaign strategy with 3 content pillars.',
        entityType: 'CampaignStrategy',
        entityId: campaign.id,
      },
      {
        userId: user.id,
        brandId: brand.id,
        campaignId: campaign.id,
        action: 'CONTENT_GENERATED',
        details: 'CopywritingAgent generated variants for LinkedIn, Facebook, Instagram.',
        entityType: 'ContentItem',
        entityId: item1.id,
      },
      {
        userId: user.id,
        brandId: brand.id,
        campaignId: campaign.id,
        action: 'REVIEW_PASSED',
        details: 'ReviewAgent scored content item (Brand: 94, Compliance: 98).',
        entityType: 'ReviewResult',
        entityId: item1.id,
      },
      {
        userId: user.id,
        brandId: brand.id,
        campaignId: campaign.id,
        action: 'APPROVED',
        details: 'Approved by Alex Vance with reviewer comments.',
        entityType: 'Approval',
        entityId: item1.id,
      },
      {
        userId: user.id,
        brandId: brand.id,
        campaignId: campaign.id,
        action: 'PUBLISHED_SIMULATED',
        details: 'Published to LinkedIn (sim_lnk_98471203).',
        entityType: 'Publication',
        entityId: pub1.id,
      },
    ],
  });

  console.log('Database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
