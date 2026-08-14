import { describe, expect, it } from 'vitest';
import { strategyAgent } from '@/lib/ai/strategy-agent';
import { db } from '@/lib/db';

describe('Strategy Generation Brand Alignment Test', () => {
  it('should generate strategy tailored to custom company details and industry', async () => {
    const user = (await db.user.findFirst()) || (await db.user.create({ data: { email: 'test_brand_user@aicas.ai', name: 'Test User' } }));

    // Create a temporary brand in test DB
    const testBrand = await db.brand.create({
      data: {
        userId: user.id,
        name: 'Bella Coffee Roasters',
        industry: 'Food & Beverage',
        description: 'Artisanal organic coffee roasting company specializing in direct-trade single-origin espresso beans.',
        products: 'Single-origin espresso beans, Cold brew concentrate, Artisanal roast subscriptions',
        targetAudience: 'Coffee enthusiasts, independent cafe owners, and gourmet foodies',
        personality: 'Warm, Passionate, Artisanal',
        tone: 'Warm & Inviting',
        preferredVocabulary: 'artisanal, single-origin, direct-trade, freshly roasted',
        prohibitedPhrases: 'instant coffee, cheap, synthetic',
        requiredDisclaimers: 'Ethically sourced certified.',
        defaultCTA: 'Order Fresh Roasted Beans Today',
      },
    });

    const result = await strategyAgent.execute({
      taskId: 'test_task_coffee_strategy',
      tenantId: 'tenant-default',
      brandId: testBrand.id,
      input: {
        campaignId: 'test_campaign_id',
        brandId: testBrand.id,
        name: 'Summer Single-Origin Launch',
        objective: 'lead_generation',
        productOrTopic: 'Ethiopian Yirgacheffe Cold Brew',
        targetAudience: 'Gourmet Coffee Lovers',
        offerCTA: 'Get 15% Off First Bag',
        channels: ['instagram', 'facebook', 'linkedin'],
      },
    });

    expect(result.status).toBe('completed');
    expect(result.output).toBeDefined();

    const output = result.output!;
    
    // Verify industry & product integration
    expect(output.objectiveInterpretation).toContain('Ethiopian Yirgacheffe Cold Brew');
    expect(output.campaignNarrative).toContain('Bella Coffee Roasters');
    expect(output.campaignNarrative).toContain('Food & Beverage');

    // Verify content pillars are tailored to coffee/product rather than generic hardcoded AI text
    const pillarNames = output.contentPillars.map((p) => p.name).join(' ');
    expect(pillarNames).not.toContain('LLM prompts');
    expect(pillarNames).not.toContain('AI Hallucinations');
    expect(pillarNames.toLowerCase()).toMatch(/ethiopian|cold brew|food & beverage|coffee|leadership/i);

    // Clean up test brand
    await db.brand.delete({ where: { id: testBrand.id } });
  }, 15000);

  it('should incorporate user feedback, generate revision summaries, and preserve immutable Brand DNA', async () => {
    const user = (await db.user.findFirst()) || (await db.user.create({ data: { email: 'test_refresh_user@aicas.ai', name: 'Refresh User' } }));

    const testBrand = await db.brand.create({
      data: {
        userId: user.id,
        name: 'Apex CyberGuard',
        industry: 'Cybersecurity SaaS',
        description: 'Enterprise zero-trust cloud security and threat intelligence platform.',
        products: 'Zero-Trust Network Access, Cloud Workload Protection',
        targetAudience: 'CISOs, CIOs, Security Architects',
        personality: 'Authoritative, Vigilant, Technical',
        tone: 'Vigilant & Consultative',
        preferredVocabulary: 'zero-trust, threat intelligence, SOC-2, compliance',
        prohibitedPhrases: 'cheap antivirus, unhackable guarantee',
        requiredDisclaimers: 'Certified ISO-27001 & SOC-2 Type II.',
        defaultCTA: 'Schedule a Threat Surface Audit',
      },
    });

    const result = await strategyAgent.execute({
      taskId: 'test_task_feedback_refresh',
      tenantId: 'tenant-default',
      brandId: testBrand.id,
      input: {
        campaignId: 'test_campaign_id_feedback',
        brandId: testBrand.id,
        name: 'Zero Trust Launch',
        objective: 'lead_generation',
        productOrTopic: 'Cloud Workload Protection',
        targetAudience: 'CISOs',
        offerCTA: 'Schedule a Threat Surface Audit',
        channels: ['linkedin', 'telegram'],
        userFeedback: 'Emphasize our new automated SOC-2 compliance features and shift LinkedIn messaging towards consultative case studies.',
        feedbackCategories: ['Audience Focus', 'Messaging & Value Prop', 'Content Pillars'],
      },
    });

    expect(result.status).toBe('completed');
    expect(result.output).toBeDefined();

    const output = result.output!;
    expect(output.campaignNarrative).toContain('Apex CyberGuard');
    expect(output.revisionSummary).toBeDefined();
    expect(output.revisionSummary?.appliedFeedback).toContain('SOC-2');
    expect(output.revisionSummary?.feedbackCategories).toContain('Audience Focus');
    expect(output.revisionSummary?.keyChanges.length).toBeGreaterThan(0);

    // Clean up test brand
    await db.brand.delete({ where: { id: testBrand.id } });
  }, 15000);
});

