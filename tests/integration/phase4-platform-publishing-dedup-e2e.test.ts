import { describe, expect, it } from 'vitest';
import { db } from '../../src/lib/db';
import { DomainNormalizer } from '../../src/lib/brand/domain-normalizer';
import { brandDeduplicationService } from '../../src/lib/brand/brand-deduplication-service';
import { reviewAgent } from '../../src/lib/ai/review-agent';
import { governedPublisherService } from '../../src/lib/publishing/governed-publisher-service';
import { connectorCapabilityRegistry } from '../../src/lib/connectors/connector-capability-registry';

describe('Phase 4 Complete E2E Acceptance Test: Brand Deduplication, Governed Live Publishing, & Quality Gates', () => {
  it('executes end-to-end lifecycle: Duplicate Brand Block -> Quality Evaluation -> Governed Direct Publishing -> Export Fallback', async () => {
    const user = await db.user.findFirst();
    expect(user).toBeDefined();

    // 1. Create Initial Canonical Brand Profile
    const testDomain = `apexlegal${Date.now()}.com`;
    const canonicalWebsite = `https://www.${testDomain}/about`;
    const norm = DomainNormalizer.normalize(canonicalWebsite);

    const brand = await db.brand.create({
      data: {
        userId: user!.id,
        name: `Apex Legal Advisory E2E ${Date.now()}`,
        industry: 'Legal Services',
        description: 'Enterprise corporate law and compliance firm',
        products: 'Litigation Advisory, Regulatory Audits',
        targetAudience: 'General Counsel Executives',
        personality: 'Authoritative, Precision-Driven',
        tone: 'Professional & Authoritative',
        preferredVocabulary: 'Compliance, Litigation, Risk Mitigation',
        prohibitedPhrases: 'Guaranteed win, Zero risk',
        requiredDisclaimers: 'Legal advice requires executed representation agreement',
        defaultCTA: 'Schedule Consultation',
        originalWebsiteUrl: canonicalWebsite,
        canonicalWebsiteUrl: norm?.canonicalWebsiteUrl,
        normalizedDomain: norm?.normalizedDomain,
      },
    });

    expect(brand.normalizedDomain).toBe(testDomain);

    // 2. Attempt Duplicate Brand Creation using equivalent http:// domain
    const dupCheck = await brandDeduplicationService.detectDuplicate(
      'tenant-default',
      'Apex Legal Advisory Duplicate',
      `http://${testDomain}/`
    );

    expect(dupCheck.matchType).toBe('EXACT_DUPLICATE');
    // Create RAG Grounding Evidence Doc for Brand
    const kdoc = await db.brandKnowledgeDocument.create({
      data: {
        brandId: brand.id,
        filename: 'Apex_Legal_Compliance_Overview.pdf',
        fileType: 'pdf',
        fileSize: 1024,
        extractedText: 'Our legal advisory team delivers comprehensive compliance strategies across litigation and risk mitigation.',
        charCount: 120,
        chunkCount: 1,
      },
    });

    await db.knowledgeChunk.create({
      data: {
        documentId: kdoc.id,
        brandId: brand.id,
        chunkIndex: 0,
        content: 'Our legal advisory team delivers comprehensive compliance strategies across litigation and risk mitigation. Legal advice requires executed representation agreement.',
        charCount: 150,
      },
    });

    // 3. Create Campaign and Content Item
    const campaign = await db.campaign.create({
      data: {
        brandId: brand.id,
        name: 'Q3 Enterprise Legal Compliance Campaign',
        objective: 'awareness',
        productOrTopic: 'Regulatory Compliance Audit',
        description: 'Educate enterprise corporate counsel on 2026 legal compliance changes.',
        targetAudience: 'General Counsel & Operations VPs',
        offerCTA: 'Schedule Corporate Compliance Audit',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        channels: 'linkedin,telegram',
      },
    });

    const contentItem = await db.contentItem.create({
      data: {
        campaignId: campaign.id,
        title: 'Navigating Enterprise Corporate Compliance in 2026',
        coreIdea: 'Mitigating commercial litigation risk through proactive compliance audits.',
        targetAudience: 'General Counsel Executives',
        contentPillar: 'Corporate Compliance',
        format: 'text_post',
        defaultCTA: 'Schedule Corporate Compliance Audit',
        status: 'DRAFT',
      },
    });

    await db.contentVariant.create({
      data: {
        contentItemId: contentItem.id,
        channel: 'linkedin',
        hook: 'Apex Legal Advisory delivers authoritative compliance strategies for General Counsel Executives.',
        bodyText: 'Our legal advisory team delivers comprehensive compliance strategies across corporate litigation and risk mitigation. Legal advice requires executed representation agreement.',
        ctaText: 'Schedule Corporate Compliance Audit',
      },
    });

    // 4. Quality Council Review Evaluation
    const reviewRes = await reviewAgent.execute({
      taskId: 'e2e_phase4_review',
      tenantId: 'tenant-default',
      brandId: brand.id,
      input: { contentItemId: contentItem.id, brandId: brand.id },
    });

    expect(['completed', 'needs_revision']).toContain(reviewRes.status);
    expect(reviewRes.output?.brandScore).toBeGreaterThanOrEqual(70);
    expect(reviewRes.output?.factualRiskScore).toBeLessThanOrEqual(35);

    // Approve Content Item
    await db.contentItem.update({
      where: { id: contentItem.id },
      data: { status: 'APPROVED' },
    });

    // 5. Governed Live Publishing from Platform Integration
    const ik = `ik_e2e_${contentItem.id}_linkedin_${Date.now()}`;
    const pubResult = await governedPublisherService.publishNow({
      brandId: brand.id,
      contentItemId: contentItem.id,
      channel: 'linkedin',
      idempotencyKey: ik,
      userId: user!.id,
    });

    expect(pubResult.success).toBe(true);
    expect(pubResult.status).toBe('PUBLISHED');
    expect(pubResult.externalPostId).toBeDefined();

    // Verify Publication Record & Audit Event
    const pubRecord = await db.publication.findFirst({
      where: { idempotencyKey: ik },
    });
    expect(pubRecord).toBeDefined();
    expect(pubRecord?.status).toBe('SUCCESS');

    const auditEvent = await db.auditEvent.findFirst({
      where: { entityId: pubRecord?.id },
    });
    expect(auditEvent).toBeDefined();

    // 6. Verify Quora Assisted Export Fallback capability classification
    const quoraCap = connectorCapabilityRegistry.getCapability('quora');
    expect(quoraCap?.status).toBe('EXPORT_ONLY');
    expect(quoraCap?.publishing).toBe(false);

    // Clean up test records
    await db.normalizedMetricEvent.deleteMany({ where: { publicationId: pubRecord?.id } });
    await db.publication.deleteMany({ where: { idempotencyKey: ik } });
    await db.publicationLedgerEntry.deleteMany({ where: { idempotencyKey: ik } });
    await db.reviewResult.delete({ where: { contentItemId: contentItem.id } });
    await db.contentVariant.deleteMany({ where: { contentItemId: contentItem.id } });
    await db.contentItem.delete({ where: { id: contentItem.id } });
    await db.campaign.delete({ where: { id: campaign.id } });
    await db.knowledgeChunk.deleteMany({ where: { brandId: brand.id } });
    await db.brandKnowledgeDocument.deleteMany({ where: { brandId: brand.id } });
    await db.brand.delete({ where: { id: brand.id } });
  });
});
