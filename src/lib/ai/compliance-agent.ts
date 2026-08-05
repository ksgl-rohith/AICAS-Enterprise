import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';

export const ComplianceViolationSchema = z.object({
  code: z.string(),
  ruleCategory: z.enum([
    'prohibited_vocabulary',
    'missing_disclaimer',
    'pii_leak',
    'secret_leak',
    'platform_constraint',
    'regulated_claim',
    'sensitive_topic',
  ]),
  severity: z.enum(['warning', 'error', 'critical']),
  message: z.string(),
  matchedText: z.string().optional(),
  recommendedCorrection: z.string(),
  isDeterministic: z.boolean().default(true),
});

export type ComplianceViolation = z.infer<typeof ComplianceViolationSchema>;

export const ComplianceInputSchema = z.object({
  contentItemId: z.string(),
  channel: z.enum(['linkedin', 'facebook', 'instagram', 'telegram']),
  text: z.string(),
  prohibitedPhrases: z.array(z.string()).default([]),
  requiredDisclaimers: z.array(z.string()).default([]),
  region: z.string().optional().default('Global'),
});

export type ComplianceInput = z.input<typeof ComplianceInputSchema>;

export const ComplianceOutputSchema = z.object({
  contentItemId: z.string(),
  status: z.enum(['pass', 'revise', 'escalate', 'block']),
  complianceScore: z.number().min(0).max(100),
  violations: z.array(ComplianceViolationSchema),
  prohibitedPhrasesFound: z.array(z.string()),
  missingDisclaimersFound: z.array(z.string()),
  deterministicHardBlock: z.boolean(),
});

export type ComplianceOutput = z.infer<typeof ComplianceOutputSchema>;

export function runDeterministicComplianceChecks(
  text: string,
  channel: string,
  prohibitedPhrases: string[],
  requiredDisclaimers: string[]
): { violations: ComplianceViolation[]; hardBlock: boolean } {
  const violations: ComplianceViolation[] = [];
  let hardBlock = false;
  const lowerText = text.toLowerCase();

  // 1. Prohibited phrases check
  const foundProhibited: string[] = [];
  for (const phrase of prohibitedPhrases) {
    if (!phrase) continue;
    if (lowerText.includes(phrase.toLowerCase())) {
      foundProhibited.push(phrase);
      violations.push({
        code: 'ERR_PROHIBITED_PHRASE',
        ruleCategory: 'prohibited_vocabulary',
        severity: 'error',
        message: `Found prohibited phrase: "${phrase}"`,
        matchedText: phrase,
        recommendedCorrection: `Remove or replace phrase "${phrase}"`,
        isDeterministic: true,
      });
    }
  }

  // 2. Required disclaimers check
  const missingDisclaimers: string[] = [];
  for (const disclaimer of requiredDisclaimers) {
    if (!disclaimer) continue;
    if (!lowerText.includes(disclaimer.toLowerCase())) {
      missingDisclaimers.push(disclaimer);
      violations.push({
        code: 'ERR_MISSING_DISCLAIMER',
        ruleCategory: 'missing_disclaimer',
        severity: 'error',
        message: `Missing mandatory disclaimer: "${disclaimer}"`,
        recommendedCorrection: `Append disclaimer: "${disclaimer}"`,
        isDeterministic: true,
      });
    }
  }

  // 3. Secret leak check (API keys, tokens, secret passwords)
  const secretRegex = /(?:sk-[a-zA-Z0-9]{32,}|AIzaSy[a-zA-Z0-9_-]{33}|ghp_[a-zA-Z0-9]{36}|bearer\s+[a-zA-Z0-9\._-]{20,})/i;
  const secretMatch = text.match(secretRegex);
  if (secretMatch) {
    hardBlock = true;
    violations.push({
      code: 'ERR_SECRET_KEY',
      ruleCategory: 'secret_leak',
      severity: 'critical',
      message: 'Detected active API key or secret token in post body!',
      matchedText: secretMatch[0].slice(0, 8) + '...',
      recommendedCorrection: 'Redact secret credential immediately.',
      isDeterministic: true,
    });
  }

  // 4. PII Leak check (email, SSN, phone number)
  const piiEmailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const piiPhoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;

  if (piiEmailRegex.test(text) || piiPhoneRegex.test(text)) {
    violations.push({
      code: 'ERR_PII_LEAK',
      ruleCategory: 'pii_leak',
      severity: 'error',
      message: 'Potential PII (Email address or Phone number) detected in post content.',
      recommendedCorrection: 'Ensure personal data consent or remove unapproved contact info.',
      isDeterministic: true,
    });
  }

  // 5. Platform length limit check
  const platformLimits: Record<string, number> = {
    linkedin: 3000,
    facebook: 5000,
    instagram: 2200,
    telegram: 4096,
  };

  const limit = platformLimits[channel] || 3000;
  if (text.length > limit) {
    violations.push({
      code: 'ERR_PLATFORM_LIMIT',
      ruleCategory: 'platform_constraint',
      severity: 'error',
      message: `Content length (${text.length} chars) exceeds ${channel} maximum limit of ${limit} characters.`,
      recommendedCorrection: `Trim content down to under ${limit} characters.`,
      isDeterministic: true,
    });
  }

  return { violations, hardBlock };
}

export class ComplianceAgent {
  public async execute(
    task: AgentTask<ComplianceInput>
  ): Promise<AgentResult<ComplianceOutput>> {
    const startTime = Date.now();
    const { contentItemId, channel, text, prohibitedPhrases, requiredDisclaimers } = task.input;

    const { violations, hardBlock } = runDeterministicComplianceChecks(
      text,
      channel,
      prohibitedPhrases || [],
      requiredDisclaimers || []
    );

    const hasCritical = violations.some((v) => v.severity === 'critical') || hardBlock;
    const errorCount = violations.filter((v) => v.severity === 'error').length;

    let complianceScore = 100 - errorCount * 20 - (hasCritical ? 50 : 0);
    complianceScore = Math.max(0, Math.min(100, complianceScore));

    let status: 'pass' | 'revise' | 'escalate' | 'block' = 'pass';
    if (hasCritical) {
      status = 'block'; // Deterministic override: LLM cannot bypass critical block
    } else if (errorCount > 0) {
      status = 'revise';
    }

    const prohibitedPhrasesFound = violations
      .filter((v) => v.code === 'ERR_PROHIBITED_PHRASE')
      .map((v) => v.matchedText || '');

    const missingDisclaimersFound = violations
      .filter((v) => v.code === 'ERR_MISSING_DISCLAIMER')
      .map((v) => v.message);

    const output: ComplianceOutput = {
      contentItemId,
      status,
      complianceScore,
      violations,
      prohibitedPhrasesFound,
      missingDisclaimersFound,
      deterministicHardBlock: hasCritical,
    };

    return {
      taskId: task.taskId,
      agentName: 'ComplianceAgent',
      status: status === 'pass' ? 'completed' : status === 'block' ? 'blocked' : 'needs_revision',
      output,
      confidence: 1.0,
      warnings: violations.map((v) => v.message),
      evidence: [],
      evaluationScores: {
        complianceScore,
        violationCount: violations.length,
        deterministicHardBlock: hasCritical ? 1 : 0,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'deterministic-compliance-policy-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const complianceAgent = new ComplianceAgent();

// Register agent in AgentRegistry
agentRegistry.register({
  name: 'ComplianceAgent',
  version: '1.0.0',
  description: 'Enforces brand policy, disclaimers, PII/secret protection, and platform length constraints',
  executionMode: 'deterministic',
  inputSchema: ComplianceInputSchema,
  outputSchema: ComplianceOutputSchema,
  allowedTools: ['policy_checker', 'secret_scanner', 'pii_detector'],
  enabled: true,
  handler: (task) => complianceAgent.execute(task),
});
