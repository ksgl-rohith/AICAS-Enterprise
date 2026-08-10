import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { strategyAgent } from '@/lib/ai/strategy-agent';
import { copywritingAgent } from '@/lib/ai/copywriting-agent';
import { experimentAgent } from '@/lib/ai/experiment-agent';

describe('End-to-End Dynamic Industry Adaptation Acceptance Test', () => {
  let legalBrandId: string;
  let healthcareBrandId: string;

  beforeEach(async () => {
    // Ensure default test user exists
    let user = await db.user.findFirst();
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'e2e_test@aicas.ai',
          name: 'E2E Test User',
          role: 'MARKETING_MANAGER',
        },
      });
    }

    // 1. Create Legal Services Test Brand Fixture
    const legalBrand = await db.brand.create({
      data: {
        userId: user.id,
        name: 'Kandvate Legal Advisory',
        industry: 'Legal Services & Law Firm',
        description: 'Kandvate Legal Advisory provides corporate litigation, dispute resolution, contract review, and legal compliance advisory for commercial enterprises.',
        products: 'Corporate Advisory, Dispute Resolution, Commercial Law, Contract Review',
        targetAudience: 'Corporations, Chief Legal Officers, Business Founders',
        personality: 'Authoritative, Diligent, Trusted',
        tone: 'Professional, Precise',
        preferredVocabulary: 'Due Diligence, Corporate Advisory, Compliance, Commercial Law',
        prohibitedPhrases: 'cheap legal hack, guaranteed court win, unverified claim',
        requiredDisclaimers: 'Legal Disclaimer: Attorney-client consultation required.',
        defaultCTA: 'Schedule a Legal Consultation',
      },
    });
    legalBrandId = legalBrand.id;

    // Seed grounded RAG document for Legal brand
    const docLegal = await db.brandKnowledgeDocument.create({
      data: {
        brandId: legalBrandId,
        filename: 'Corporate_Legal_Advisory_Guide.pdf',
        fileType: 'pdf',
        fileSize: 1024,
        extractedText: 'Kandvate Legal Advisory specializes in commercial dispute resolution, contract drafting, and regulatory compliance for corporations.',
        charCount: 200,
        chunkCount: 1,
      },
    });

    await db.knowledgeChunk.create({
      data: {
        documentId: docLegal.id,
        brandId: legalBrandId,
        chunkIndex: 1,
        content: 'Kandvate Legal Advisory specializes in commercial dispute resolution, contract drafting, and regulatory compliance for corporations.',
        charCount: 150,
      },
    });

    // 2. Create Healthcare Test Brand Fixture
    const healthBrand = await db.brand.create({
      data: {
        userId: user.id,
        name: 'Apex Health Care',
        industry: 'Healthcare & Clinical Services',
        description: 'Apex Health Care is a specialized medical clinical provider delivering patient care, preventive diagnostics, and wellness programs.',
        products: 'Clinical Diagnostics, Patient Wellness, Preventive Health Screening',
        targetAudience: 'Patients, Healthcare Administrators, Medical Directors',
        personality: 'Empathetic, Clinical, Trusted',
        tone: 'Compassionate, Data-Backed',
        preferredVocabulary: 'Patient Care, Clinical Excellence, Preventive Health',
        prohibitedPhrases: 'instant miracle cure, unverified medical claim',
        requiredDisclaimers: 'Medical Disclaimer: Consult a qualified medical practitioner.',
        defaultCTA: 'Book a Clinical Consultation',
      },
    });
    healthcareBrandId = healthBrand.id;
  });

  it('should generate 100% legal-services strategy and copy for Legal brand with ZERO multi-agent AI leaks', async () => {
    // A. Generate Strategy for Legal Brand
    const stratResult = await strategyAgent.execute({
      taskId: 'task_e2e_legal_strat',
      tenantId: 'tenant-default',
      brandId: legalBrandId,
      campaignId: 'camp_legal_e2e',
      input: {
        campaignId: 'camp_legal_e2e',
        brandId: legalBrandId,
        name: 'Commercial Contract Compliance 2026',
        objective: 'lead_generation',
        productOrTopic: 'Corporate Advisory & Dispute Resolution',
        targetAudience: 'Chief Legal Officers & Founders',
        offerCTA: 'Schedule a Legal Consultation',
        channels: ['linkedin', 'facebook'],
      },
    });

    expect(stratResult.status).toBe('completed');
    const strat = stratResult.output!;
    expect(strat.campaignNarrative).toContain('Kandvate');
    expect(strat.campaignNarrative.toLowerCase()).not.toContain('multi-agent');
    expect(strat.campaignNarrative.toLowerCase()).not.toContain('llm orchestration');

    // Verify content pillars relate to Legal Services
    const pillarNames = strat.contentPillars.map((p) => p.name).join(' ');
    expect(pillarNames.toLowerCase()).toContain('dispute resolution');

    // B. Generate Copywriting for Legal Brand
    const copyResult = await copywritingAgent.execute({
      taskId: 'task_e2e_legal_copy',
      tenantId: 'tenant-default',
      brandId: legalBrandId,
      campaignId: 'camp_legal_e2e',
      input: {
        brandId: legalBrandId,
        campaignId: 'camp_legal_e2e',
        topicTitle: 'Navigating Commercial Contract Disputes',
        contentPillar: 'Corporate Advisory',
        targetAudience: 'Chief Legal Officers',
        format: 'carousel',
        defaultCTA: 'Schedule a Legal Consultation',
        channels: ['linkedin', 'instagram'],
      },
    });

    expect(copyResult.status).toBe('completed');
    const copyText = copyResult.output!.variants.map((v) => v.bodyText + ' ' + (v.headline || '')).join(' ');

    expect(copyText.toLowerCase()).toContain('legal');
    expect(copyText.toLowerCase()).not.toContain('multi-agent');
    expect(copyText.toLowerCase()).not.toContain('apexai summit');
  });

  it('should dynamically adapt strategy and copy for Healthcare brand', async () => {
    // A. Generate Strategy for Healthcare Brand
    const stratResult = await strategyAgent.execute({
      taskId: 'task_e2e_health_strat',
      tenantId: 'tenant-default',
      brandId: healthcareBrandId,
      campaignId: 'camp_health_e2e',
      input: {
        campaignId: 'camp_health_e2e',
        brandId: healthcareBrandId,
        name: 'Preventive Health Screening 2026',
        objective: 'brand_awareness',
        productOrTopic: 'Clinical Diagnostics & Patient Care',
        targetAudience: 'Healthcare Administrators & Patients',
        offerCTA: 'Book a Clinical Consultation',
        channels: ['linkedin', 'facebook'],
      },
    });

    expect(stratResult.status).toBe('completed');
    const strat = stratResult.output!;
    expect(strat.campaignNarrative).toContain('Apex Health Care');
    expect(strat.campaignNarrative.toLowerCase()).not.toContain('dispute resolution');
    expect(strat.campaignNarrative.toLowerCase()).not.toContain('multi-agent');

    // B. Generate AI Experiment Recommendation for Healthcare Brand
    const expRecs = await experimentAgent.generateAiRecommendations(healthcareBrandId);
    expect(expRecs.length).toBeGreaterThan(0);
    expect(expRecs[0].hypothesis).toContain('Apex Health Care');
  });
});
