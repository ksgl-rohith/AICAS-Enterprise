import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';

export const MessageClassificationEnum = z.enum([
  'POSITIVE',
  'NEUTRAL',
  'NEGATIVE',
  'QUESTION',
  'SUPPORT_REQUEST',
  'SALES_LEAD',
  'SPAM',
  'ABUSE',
  'SENSITIVE',
  'CRISIS_RISK',
]);

export type MessageClassification = z.infer<typeof MessageClassificationEnum>;

export const CommunityResponseSchema = z.object({
  classification: MessageClassificationEnum,
  suggestedResponse: z.string(),
  isEscalated: z.boolean(),
  escalationReason: z.string().optional(),
  requiresHumanReview: z.boolean(),
  confidence: z.number(),
  privateDataCheckPassed: z.boolean(),
});

export type CommunityResponseOutput = z.infer<typeof CommunityResponseSchema>;

export interface CommunityMessageInput {
  brandId: string;
  platform: 'linkedin' | 'facebook' | 'instagram' | 'telegram';
  externalMessageId: string;
  senderHandle: string;
  content: string;
}

export class CommunityAgent {
  public async execute(
    task: AgentTask<CommunityMessageInput>
  ): Promise<AgentResult<CommunityResponseOutput>> {
    const startTime = Date.now();
    const tenantId = task.tenantId || 'tenant-default';
    const messageText = task.input.content.toLowerCase();

    // Sensitive / Crisis keyword detection
    const isCrisisOrSensitive =
      messageText.includes('lawsuit') ||
      messageText.includes('suing') ||
      messageText.includes('security breach') ||
      messageText.includes('data leak') ||
      messageText.includes('vulnerability') ||
      messageText.includes('hacked') ||
      messageText.includes('medical') ||
      messageText.includes('financial advice');

    const isSalesLead =
      messageText.includes('pricing') ||
      messageText.includes('demo') ||
      messageText.includes('buy enterprise') ||
      messageText.includes('contact sales');

    const defaultClassification: MessageClassification = isCrisisOrSensitive
      ? 'CRISIS_RISK'
      : isSalesLead
      ? 'SALES_LEAD'
      : 'QUESTION';

    const mockFallback: CommunityResponseOutput = {
      classification: defaultClassification,
      suggestedResponse: isCrisisOrSensitive
        ? 'Thank you for reaching out. Our security and risk management team has received your message and will review it immediately.'
        : 'Thank you for your interest in AICAS Enterprise! You can view our governance architecture and schedule a custom demo on our website.',
      isEscalated: isCrisisOrSensitive,
      escalationReason: isCrisisOrSensitive ? 'Sensitive legal, security, or crisis keywords detected.' : undefined,
      requiresHumanReview: true,
      confidence: 0.94,
      privateDataCheckPassed: true,
    };

    const systemPrompt = `You are an AI Community Management & Moderation Specialist for Enterprise Brands.
Classify incoming community messages into 10 categories (POSITIVE, NEUTRAL, NEGATIVE, QUESTION, SUPPORT_REQUEST, SALES_LEAD, SPAM, ABUSE, SENSITIVE, CRISIS_RISK).
Draft appropriate responses using approved brand voice.
CRITICAL SAFETY RULES:
- Escalate sensitive, legal, medical, financial, security, or crisis messages.
- Never include private account numbers, internal passwords, or PII.
- All responses require human approval before posting.`;

    const userPrompt = `Brand ID: ${task.input.brandId}
Platform: ${task.input.platform}
Sender: ${task.input.senderHandle}
Message: ${task.input.content}`;

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: CommunityResponseSchema,
      mockFallback,
      tenantId,
      agentName: 'CommunityAgent',
    });

    // Enforce safety override
    if (isCrisisOrSensitive) {
      res.output.classification = 'CRISIS_RISK';
      res.output.isEscalated = true;
      res.output.escalationReason = 'Sensitive legal/security/crisis content flagged by safety heuristics.';
      res.output.requiresHumanReview = true;
    }

    // Auto-posting check feature flag
    const isAutoPostAllowed = process.env.ENABLE_AUTO_COMMUNITY_REPLIES === 'true';
    if (!isAutoPostAllowed) {
      res.output.requiresHumanReview = true;
    }

    // Save to Community Review Inbox DB
    await db.communityMessage.upsert({
      where: { externalMessageId: task.input.externalMessageId },
      create: {
        tenantId,
        brandId: task.input.brandId,
        platform: task.input.platform,
        externalMessageId: task.input.externalMessageId,
        senderHandle: task.input.senderHandle,
        content: task.input.content,
        classification: res.output.classification,
        suggestedResponse: res.output.suggestedResponse,
        isEscalated: res.output.isEscalated,
        escalationReason: res.output.escalationReason || null,
        status: 'INBOX',
      },
      update: {
        classification: res.output.classification,
        suggestedResponse: res.output.suggestedResponse,
        isEscalated: res.output.isEscalated,
        escalationReason: res.output.escalationReason || null,
      },
    });

    return {
      taskId: task.taskId,
      status: res.output.isEscalated ? 'needs_revision' : 'completed',
      output: res.output,
      confidence: res.output.confidence,
      warnings: res.output.isEscalated ? [`Escalated message: ${res.output.escalationReason}`] : [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-community',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const communityAgent = new CommunityAgent();
