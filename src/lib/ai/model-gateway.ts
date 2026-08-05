import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { telemetryService } from '@/lib/observability/telemetry';

export interface ModelGatewayRequest<Input, Output> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<Output>;
  mockFallback: Output;
  modelName?: string;
  tenantId?: string;
  agentName?: string;
}

export interface ModelGatewayResponse<Output> {
  output: Output;
  modelUsed: string;
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

  public calculateTokenCost(modelName: string, tokens: number): number {
    // Standard cost estimate (e.g. $0.0015 per 1k tokens standard)
    if (modelName.includes('gpt-4o')) return (tokens / 1000) * 0.005;
    if (modelName.includes('gemini-1.5-pro')) return (tokens / 1000) * 0.003;
    return (tokens / 1000) * 0.001; // economy / flash tier
  }

  public async generateStructured<Input, Output>(
    request: ModelGatewayRequest<Input, Output>
  ): Promise<ModelGatewayResponse<Output>> {
    const startTime = Date.now();
    const tenantId = request.tenantId || 'tenant-default';
    const agentName = request.agentName || 'GeneralAgent';

    // 1. Budget Enforcement Check
    const budget = await db.costBudget.findUnique({ where: { tenantId } });
    if (budget && budget.spentUsd >= budget.monthlyBudgetUsd) {
      telemetryService.recordMetric('budget_exhaustion', budget.spentUsd, { tenantId, agentRunId: agentName });
      console.warn(`[ModelGateway] Tenant ${tenantId} budget exhausted (${budget.spentUsd} >= ${budget.monthlyBudgetUsd}). Fallback to mock.`);
      return {
        output: request.mockFallback,
        modelUsed: 'budget-exceeded-fallback',
        latencyMs: Date.now() - startTime,
        tokensUsed: 0,
        estimatedCostUsd: 0,
        usedMock: true,
        usedFallback: true,
      };
    }

    if (this.mode === 'mock') {
      await new Promise((r) => setTimeout(r, 100));
      const tokens = 250;
      const cost = this.calculateTokenCost('mock-engine-v1', tokens);

      await this.recordCostUsage(tenantId, agentName, 'mock-engine-v1', 'ECONOMY', tokens / 2, tokens / 2, cost);

      return {
        output: request.mockFallback,
        modelUsed: 'mock-engine-v1',
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

        if (!res.ok) {
          throw new Error(`OpenAI API status ${res.status}`);
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedRaw = JSON.parse(jsonText);
        const validatedOutput = request.schema.parse(parsedRaw);

        const tokens = data.usage?.total_tokens || Math.ceil(text.length / 4);
        const cost = this.calculateTokenCost(modelName, tokens);

        await this.recordCostUsage(tenantId, agentName, modelName, 'STANDARD', Math.ceil(tokens * 0.4), Math.ceil(tokens * 0.6), cost);

        return {
          output: validatedOutput,
          modelUsed: modelName,
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
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const fullPrompt = `${request.systemPrompt}\n\nUSER PROMPT:\n${request.userPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object matching the requested schema.`;
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedRaw = JSON.parse(jsonText);
        const validatedOutput = request.schema.parse(parsedRaw);

        const tokens = Math.ceil(text.length / 4);
        const cost = this.calculateTokenCost(modelName, tokens);

        await this.recordCostUsage(tenantId, agentName, modelName, 'STANDARD', Math.ceil(tokens * 0.4), Math.ceil(tokens * 0.6), cost);

        return {
          output: validatedOutput,
          modelUsed: modelName,
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
