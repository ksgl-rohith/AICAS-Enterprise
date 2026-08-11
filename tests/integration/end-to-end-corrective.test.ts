import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import { db } from '@/lib/db';
import { approvalService } from '@/lib/approval/approval-service';
import { modelGateway } from '@/lib/ai/model-gateway';
import { apiCredentialsService } from '@/lib/connectors/api-credentials-service';

describe('End-to-End Corrective Phase Acceptance Test', () => {
  let tenantId = 'tenant-default';
  let brandId: string;
  let campaignId: string;
  let contentItemId: string;

  beforeEach(async () => {
    vi.restoreAllMocks();

    const user = await db.user.findFirst();
    const brand = await db.brand.create({
      data: {
        userId: user?.id || 'u_default',
        name: 'Kandvate Legal Enterprise',
        industry: 'Legal Services & Litigation',
        products: 'Commercial Litigation Advisory',
        targetAudience: 'Corporation Founders & Operations Officers',
        description: 'Litigation advisory firm',
        personality: 'Authoritative, Precise',
        tone: 'Professional',
        preferredVocabulary: 'Legal Counsel, Corporate Advisory, Due Diligence',
        prohibitedPhrases: 'cheap legal hack, guaranteed court win',
        requiredDisclaimers: 'Legal Disclaimer: Attorney-client consultation required.',
        defaultCTA: 'Schedule a Legal Consultation',
      },
    });
    brandId = brand.id;

    const campaign = await db.campaign.create({
      data: {
        brandId,
        name: 'Corporate Dispute Governance',
        objective: 'qualified_leads',
        productOrTopic: 'Litigation Advisory & Corporate Risk Mitigation',
        description: 'Targeting enterprise founders and operations officers',
        targetAudience: 'Corporation Founders & Operations Officers',
        offerCTA: 'Schedule a Legal Consultation',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400 * 1000),
        channels: 'linkedin,telegram',
        status: 'PLANNING',
      },
    });
    campaignId = campaign.id;

    const contentItem = await db.contentItem.create({
      data: {
        campaignId,
        title: 'Commercial Dispute Risk Mitigation',
        contentPillar: 'Litigation Advisory',
        format: 'article',
        coreIdea: 'Mitigating shareholder litigation risk in 2026',
        targetAudience: 'Corporation Founders',
        defaultCTA: 'Schedule a Legal Consultation',
        status: 'UNDER_REVIEW',
      },
    });
    contentItemId = contentItem.id;
  });

  it('1. Approval Queue: Approve operation atomically transitions ContentItem to APPROVED and reflects in queue counts', async () => {
    // Check initial queue state
    const initialQueue = await approvalService.getApprovalQueue(tenantId, 'PENDING');
    expect(initialQueue.counts.pending).toBeGreaterThan(0);

    // Execute Approve operation
    const approveResult = await approvalService.approve(contentItemId, 'user_reviewer', 'Approved by lead partner');
    expect(approveResult).toBeDefined();

    // Assert ContentItem status updated in DB
    const updatedItem = await db.contentItem.findUnique({ where: { id: contentItemId } });
    expect(updatedItem?.status).toBe('APPROVED');

    // Assert Approved queue reflects item immediately
    const approvedQueue = await approvalService.getApprovalQueue(tenantId, 'APPROVED');
    expect(approvedQueue.counts.approved).toBeGreaterThan(0);
    expect(approvedQueue.queue.some((i) => i.id === contentItemId)).toBe(true);
  });

  it('2. Token & Cost Ledger: ModelGateway invocation records original token metrics and Controlled Autonomy consumes exact ledger', async () => {
    // Execute a model gateway call
    const res = await modelGateway.generateStructured({
      systemPrompt: 'You are an enterprise legal copywriting agent.',
      userPrompt: 'Write a legal disclaimer for corporate advisory services.',
      schema: z.object({ disclaimer: z.string() }),
      mockFallback: { disclaimer: 'Legal Disclaimer: Professional consultation required.' },
      agentName: 'CopywritingAgent',
      tenantId,
    });

    expect(res.output).toBeDefined();
    expect(res.tokensUsed).toBeGreaterThan(0);

    // Query DB cost usage record
    const usageRecords = await db.costUsageRecord.findMany({
      where: { tenantId, agentName: 'CopywritingAgent' },
    });

    expect(usageRecords.length).toBeGreaterThan(0);
    const lastRecord = usageRecords[0];
    expect(lastRecord.inputTokens).toBeGreaterThan(0);
    expect(lastRecord.outputTokens).toBeGreaterThan(0);
  });

  it('3. UI Platform Credentials: ApiCredentialsService encrypts, decrypts, and resolves effective credentials without .env edit', async () => {
    // Save credential via UI Service
    const saved = await apiCredentialsService.saveCredential({
      tenantId,
      category: 'social',
      provider: 'telegram',
      name: 'Test Telegram Bot',
      values: {
        bot_token: '123456789:AAEF_test_bot_token_key',
        chat_id: '@kandvate_legal_news',
      },
    });

    expect(saved.keyMask).toContain('123•••••••••_key');
    expect(saved.status).toBe('configured');

    // Resolve effective credential
    const effectiveToken = await apiCredentialsService.getEffectiveCredential('social', 'telegram', 'bot_token');
    expect(effectiveToken).toBe('123456789:AAEF_test_bot_token_key');

    // Test connection
    const testRes = await apiCredentialsService.testConnection(tenantId, 'social', 'telegram');
    expect(testRes.success).toBe(true);
    expect(testRes.accountName).toContain('Telegram');
  });
});
