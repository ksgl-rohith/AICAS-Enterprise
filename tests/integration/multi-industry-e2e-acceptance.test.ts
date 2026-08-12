import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { websiteBrandIntelligenceAgent } from '@/lib/ai/website-brand-intelligence-agent';
import { brandContextPackageBuilder } from '@/lib/ai/brand-context-package';
import { strategyAgent } from '@/lib/ai/strategy-agent';
import { copywritingAgent } from '@/lib/ai/copywriting-agent';
import { contentPlanningAgent } from '@/lib/ai/content-planning-agent';
import { contentDiversityEvaluator } from '@/lib/ai/content-diversity-evaluator';

describe('Multi-Industry End-to-End Acceptance Test (SCENARIO A & SCENARIO B)', () => {
  let user: any;

  beforeEach(async () => {
    user = await db.user.findFirst();
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'e2e-test@aicas.ai',
          name: 'E2E Acceptance Tester',
          role: 'ADMIN',
        },
      });
    }
  });

  it('SCENARIO A: Website Brand Intelligence normalizes www URL, extracts insurance offerings, and generates dynamic insurance strategy & copy with ZERO AI leaks', async () => {
    // 1. Extract Website Brand Intelligence for www.policybazaar.com
    const intel = await websiteBrandIntelligenceAgent.extractBrandIntelligence('https://www.policybazaar.com');

    expect(intel.domain).toBe('policybazaar.com');
    expect(intel.identity.name.value).not.toBe('WWW');
    expect(intel.identity.name.value).not.toBe('www');
    expect(intel.identity.name.value).toContain('Policybazaar');

    // 2. Persist Brand in DB
    const insuranceBrand = await db.brand.create({
      data: {
        userId: user.id,
        name: intel.identity.name.value,
        industry: 'Insurance & Financial Services Marketplace',
        description: intel.identity.description.value,
        products: intel.productsAndServices.products.value.join(', '),
        targetAudience: intel.audience.targetAudience.value,
        personality: intel.voiceAndGovernance.personality.value,
        tone: intel.voiceAndGovernance.tone.value,
        preferredVocabulary: intel.voiceAndGovernance.preferredVocabulary.value.join(', '),
        prohibitedPhrases: intel.voiceAndGovernance.prohibitedPhrases.value.join(', '),
        requiredDisclaimers: intel.voiceAndGovernance.requiredDisclaimers.value.join('\n'),
        defaultCTA: 'Compare Insurance Plans & Get Quote',
      },
    });

    // 3. Create Campaign
    const campaign = await db.campaign.create({
      data: {
        brandId: insuranceBrand.id,
        name: 'Health & Motor Insurance Protection 2026',
        objective: 'qualified_leads',
        productOrTopic: intel.productsAndServices.products.value[0] || 'Health Insurance',
        description: 'Health and motor insurance protection campaign 2026',
        targetAudience: insuranceBrand.targetAudience,
        offerCTA: insuranceBrand.defaultCTA,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-30'),
        channels: 'linkedin,facebook,instagram',
        status: 'DRAFT',
      },
    });

    // 4. Generate Strategy
    const stratResult = await strategyAgent.execute({
      taskId: 'task_e2e_strat_insurance',
      tenantId: 'tenant-default',
      brandId: insuranceBrand.id,
      input: {
        campaignId: campaign.id,
        brandId: insuranceBrand.id,
        name: campaign.name,
        objective: campaign.objective,
        productOrTopic: campaign.productOrTopic,
        targetAudience: campaign.targetAudience,
        offerCTA: campaign.offerCTA,
        channels: ['linkedin', 'facebook', 'instagram'],
      },
    });

    expect(stratResult.status).toBe('completed');
    expect(stratResult.output?.campaignNarrative).toBeDefined();

    // 5. Generate Copywriting Variants
    const copyResult = await copywritingAgent.execute({
      taskId: 'task_e2e_copy_insurance',
      tenantId: 'tenant-default',
      brandId: insuranceBrand.id,
      input: {
        brandId: insuranceBrand.id,
        campaignId: campaign.id,
        topicTitle: 'Comprehensive Health Coverage for Families',
        contentPillar: 'Health & Family Protection',
        targetAudience: insuranceBrand.targetAudience,
        format: 'text_post',
        defaultCTA: insuranceBrand.defaultCTA,
        channels: ['linkedin', 'facebook', 'instagram'],
        archetype: 'educational_explainer',
      },
    });

    expect(copyResult.status).toBe('completed');
    const linkedinVariant = copyResult.output?.variants.find((v) => v.channel === 'linkedin');
    expect(linkedinVariant).toBeDefined();
    expect(linkedinVariant?.bodyText.toLowerCase()).not.toContain('multi-agent studio');
    expect(linkedinVariant?.bodyText.toLowerCase()).not.toContain('ai workflow engine');
  }, 15000);

  it('SCENARIO B: Brand Intelligence for Legal Advisory generates distinct legal strategy and copy with legal disclaimers', async () => {
    // 1. Create Legal Advisory Brand
    const legalBrand = await db.brand.create({
      data: {
        userId: user.id,
        name: 'Kandvate Legal Counsel',
        industry: 'Legal Services & Law Firm',
        description: 'Corporate litigation, shareholder dispute resolution, and cross-border commercial advisory.',
        products: 'Corporate Litigation, Commercial Advisory, M&A Due Diligence, Regulatory Compliance',
        targetAudience: 'Corporation Founders, Managing Directors, General Counsel',
        personality: 'Authoritative, Diligent, Trusted',
        tone: 'Professional & Precise',
        preferredVocabulary: 'Legal Counsel, Corporate Advisory, Commercial Law, Due Diligence',
        prohibitedPhrases: 'Guaranteed court win, Cheap legal hacks',
        requiredDisclaimers: 'Legal Disclaimer: Attorney consultation required. Information does not constitute formal legal advice.',
        defaultCTA: 'Schedule a Legal Consultation',
      },
    });

    // 2. Create Campaign
    const campaign = await db.campaign.create({
      data: {
        brandId: legalBrand.id,
        name: 'Shareholder Litigation Risk Mitigation 2026',
        objective: 'qualified_leads',
        productOrTopic: 'Corporate Litigation',
        description: 'Shareholder litigation risk mitigation campaign 2026',
        targetAudience: legalBrand.targetAudience,
        offerCTA: legalBrand.defaultCTA,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-30'),
        channels: 'linkedin',
        status: 'DRAFT',
      },
    });

    // 3. Generate Copywriting
    const copyResult = await copywritingAgent.execute({
      taskId: 'task_e2e_copy_legal',
      tenantId: 'tenant-default',
      brandId: legalBrand.id,
      input: {
        brandId: legalBrand.id,
        campaignId: campaign.id,
        topicTitle: 'Commercial Dispute Resolution Strategies',
        contentPillar: 'Corporate Litigation Advisory',
        targetAudience: legalBrand.targetAudience,
        format: 'text_post',
        defaultCTA: legalBrand.defaultCTA,
        channels: ['linkedin'],
        archetype: 'myth_vs_fact',
      },
    });

    expect(copyResult.status).toBe('completed');
    const variant = copyResult.output?.variants[0];
    expect(variant?.bodyText).toContain('Legal Disclaimer');
    expect(variant?.bodyText.toLowerCase()).not.toContain('insurance policy');
    expect(variant?.bodyText.toLowerCase()).not.toContain('apex workflow engine');
  });
});
