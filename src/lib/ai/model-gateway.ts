import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { telemetryService } from '@/lib/observability/telemetry';

export type BillingClass = 'FREE' | 'PAID';
export type BillingSubtype =
  | 'local_model'
  | 'free_api_tier'
  | 'promotional_credit'
  | 'enterprise_included'
  | 'mock_engine'
  | 'token_billed'
  | 'request_billed'
  | 'media_billed'
  | 'subscription_allocated';

export interface ModelGatewayRequest<Input, Output> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<Output>;
  mockFallback: Output;
  modelName?: string;
  tenantId?: string;
  agentName?: string;
  taskComplexity?: 'low' | 'medium' | 'high';
  requirePaidQuality?: boolean;
}

export interface ModelGatewayResponse<Output> {
  output: Output;
  modelUsed: string;
  billingClass: BillingClass;
  billingSubtype: BillingSubtype;
  routingReason: string;
  latencyMs: number;
  tokensUsed: number;
  estimatedCostUsd: number;
  usedMock: boolean;
  usedFallback: boolean;
}

export class ModelGateway {
  private geminiKey: string;
  private openaiKey: string;
  private mode: 'openai' | 'gemini' | 'mock';
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    this.openaiKey = (process.env.OPENAI_API_KEY || '').trim();
    const configuredMode = (process.env.AI_MODE || 'mock').toLowerCase();

    if (configuredMode === 'openai' && this.openaiKey !== '') {
      this.mode = 'openai';
    } else if (configuredMode === 'gemini' && this.geminiKey !== '') {
      this.mode = 'gemini';
      this.genAI = new GoogleGenerativeAI(this.geminiKey);
    } else if (this.openaiKey !== '' && configuredMode !== 'mock' && configuredMode !== 'gemini') {
      this.mode = 'openai';
    } else if (this.geminiKey !== '' && configuredMode !== 'mock') {
      this.mode = 'gemini';
      this.genAI = new GoogleGenerativeAI(this.geminiKey);
    } else {
      this.mode = 'mock';
    }
  }

  public getMode(): 'openai' | 'gemini' | 'mock' {
    return this.mode;
  }

  public calculateTokenCost(modelName: string, tokens: number): { cost: number; billingClass: BillingClass; billingSubtype: BillingSubtype } {
    if (modelName.includes('mock') || modelName.includes('fallback') || modelName.includes('free-tier')) {
      return { cost: 0.0, billingClass: 'FREE', billingSubtype: 'mock_engine' };
    }
    if (modelName.includes('gemini-1.5-flash') || modelName.includes('gemini-2.5-flash')) {
      // Free quota tier vs token billed
      const isFreeTier = process.env.USE_GEMINI_FREE_TIER === 'true';
      if (isFreeTier) {
        return { cost: 0.0, billingClass: 'FREE', billingSubtype: 'free_api_tier' };
      }
      return { cost: (tokens / 1000) * 0.0005, billingClass: 'PAID', billingSubtype: 'token_billed' };
    }
    if (modelName.includes('gpt-4o')) {
      return { cost: (tokens / 1000) * 0.005, billingClass: 'PAID', billingSubtype: 'token_billed' };
    }
    return { cost: (tokens / 1000) * 0.001, billingClass: 'PAID', billingSubtype: 'token_billed' };
  }

  public async generateStructured<Input, Output>(
    request: ModelGatewayRequest<Input, Output>
  ): Promise<ModelGatewayResponse<Output>> {
    const startTime = Date.now();
    const tenantId = request.tenantId || 'tenant-default';
    const agentName = request.agentName || 'GeneralAgent';

    // Check system execution preference from DB
    const pref = await db.userPreferences.findFirst();
    const systemExecutionMode = pref?.executionMode || 'mock';

    // Routing Decision Logic
    let routingReason = 'Standard gateway routing';
    if (request.taskComplexity === 'low' && !request.requirePaidQuality) {
      routingReason = 'Classification/low-complexity task routed to economy tier';
    } else if (request.requirePaidQuality) {
      routingReason = 'Complex strategy evaluation requiring higher quality threshold';
    }

    // Budget Enforcement Check
    const budget = await db.costBudget.findUnique({ where: { tenantId } });
    if (budget && budget.spentUsd >= budget.monthlyBudgetUsd) {
      telemetryService.recordMetric('budget_exhaustion', budget.spentUsd, { tenantId, agentRunId: agentName });
      console.warn(`[ModelGateway] Tenant ${tenantId} budget exhausted (${budget.spentUsd} >= ${budget.monthlyBudgetUsd}). Fallback to mock.`);
      
      await this.recordCostUsage(tenantId, agentName, 'budget-exceeded-fallback', 'FREE', 'mock_engine', 'Budget threshold reached; routed to local fallback', 'ECONOMY', 0, 0, 0);

      return {
        output: request.mockFallback,
        modelUsed: 'budget-exceeded-fallback',
        billingClass: 'FREE',
        billingSubtype: 'mock_engine',
        routingReason: 'Budget limit reached; free fallback activated',
        latencyMs: Date.now() - startTime,
        tokensUsed: 0,
        estimatedCostUsd: 0,
        usedMock: true,
        usedFallback: true,
      };
    }

    if (this.mode === 'mock' || systemExecutionMode === 'mock') {
      await new Promise((r) => setTimeout(r, 80));
      const tokens = 250;
      const { cost, billingClass, billingSubtype } = this.calculateTokenCost('mock-engine-v1', tokens);

      await this.recordCostUsage(tenantId, agentName, 'mock-engine-v1', billingClass, billingSubtype, routingReason, 'ECONOMY', tokens / 2, tokens / 2, cost);

      return {
        output: request.mockFallback,
        modelUsed: 'mock-engine-v1',
        billingClass,
        billingSubtype,
        routingReason,
        latencyMs: Date.now() - startTime,
        tokensUsed: tokens,
        estimatedCostUsd: cost,
        usedMock: true,
        usedFallback: false,
      };
    }

    if (this.mode === 'openai') {
      try {
        const modelName = request.modelName || process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: request.systemPrompt },
              {
                role: 'user',
                content: `${request.userPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object matching the requested schema.`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (!res.ok) throw new Error(`OpenAI API status ${res.status}`);

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedRaw = JSON.parse(jsonText);
        const validatedOutput = request.schema.parse(parsedRaw);

        const tokens = data.usage?.total_tokens || Math.ceil(text.length / 4);
        const { cost, billingClass, billingSubtype } = this.calculateTokenCost(modelName, tokens);

        await this.recordCostUsage(tenantId, agentName, modelName, billingClass, billingSubtype, routingReason, 'STANDARD', Math.ceil(tokens * 0.4), Math.ceil(tokens * 0.6), cost);

        return {
          output: validatedOutput,
          modelUsed: modelName,
          billingClass,
          billingSubtype,
          routingReason,
          latencyMs: Date.now() - startTime,
          tokensUsed: tokens,
          estimatedCostUsd: cost,
          usedMock: false,
          usedFallback: false,
        };
      } catch (error) {
        console.warn('OpenAI generation failed, falling back to mock:', error);
        return {
          output: request.mockFallback,
          modelUsed: 'openai-fallback-mock',
          billingClass: 'FREE',
          billingSubtype: 'mock_engine',
          routingReason: 'OpenAI API transient failure fallback',
          latencyMs: Date.now() - startTime,
          tokensUsed: 0,
          estimatedCostUsd: 0,
          usedMock: true,
          usedFallback: true,
        };
      }
    }

    if (this.mode === 'gemini' && this.genAI) {
      try {
        const modelName = request.modelName || process.env.GEMINI_TEXT_MODEL || 'gemini-1.5-flash';
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        });

        const fullPrompt = `${request.systemPrompt}\n\nUSER PROMPT:\n${request.userPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object matching the requested schema.`;
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedRaw = JSON.parse(jsonText);
        const validatedOutput = request.schema.parse(parsedRaw);

        const tokens = Math.ceil(text.length / 4);
        const { cost, billingClass, billingSubtype } = this.calculateTokenCost(modelName, tokens);

        await this.recordCostUsage(tenantId, agentName, modelName, billingClass, billingSubtype, routingReason, 'STANDARD', Math.ceil(tokens * 0.4), Math.ceil(tokens * 0.6), cost);

        return {
          output: validatedOutput,
          modelUsed: modelName,
          billingClass,
          billingSubtype,
          routingReason,
          latencyMs: Date.now() - startTime,
          tokensUsed: tokens,
          estimatedCostUsd: cost,
          usedMock: false,
          usedFallback: false,
        };
      } catch (error) {
        console.warn('Gemini AI generation failed, falling back to mock:', error);
        return {
          output: request.mockFallback,
          modelUsed: 'gemini-fallback-mock',
          billingClass: 'FREE',
          billingSubtype: 'mock_engine',
          routingReason: 'Gemini API transient failure fallback',
          latencyMs: Date.now() - startTime,
          tokensUsed: 0,
          estimatedCostUsd: 0,
          usedMock: true,
          usedFallback: true,
        };
      }
    }

    return {
      output: request.mockFallback,
      modelUsed: 'fallback-mock',
      billingClass: 'FREE',
      billingSubtype: 'mock_engine',
      routingReason: 'Default sandbox mode',
      latencyMs: Date.now() - startTime,
      tokensUsed: 0,
      estimatedCostUsd: 0,
      usedMock: true,
      usedFallback: true,
    };
  }

  private async recordCostUsage(
    tenantId: string,
    agentName: string,
    modelName: string,
    billingClass: BillingClass,
    billingSubtype: BillingSubtype,
    routingReason: string,
    tier: string,
    inputTokens: number,
    outputTokens: number,
    costUsd: number
  ) {
    const isAnomaly = costUsd > 1.0;
    if (isAnomaly) {
      telemetryService.recordMetric('cost_anomalies', costUsd, { tenantId, agentRunId: agentName });
    }

    await db.costUsageRecord.create({
      data: {
        tenantId,
        agentName,
        modelName,
        billingClass,
        billingSubtype,
        routingReason,
        tier,
        inputTokens,
        outputTokens,
        estimatedCostUsd: costUsd,
        actualCostUsd: costUsd,
        isAnomaly,
      },
    });

    await db.costBudget.upsert({
      where: { tenantId },
      create: {
        tenantId,
        spentUsd: costUsd,
        tokensUsed: inputTokens + outputTokens,
      },
      update: {
        spentUsd: { increment: costUsd },
        tokensUsed: { increment: inputTokens + outputTokens },
      },
    });
  }
}

export const modelGateway = new ModelGateway();
