import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export interface ModelGatewayRequest<Input, Output> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<Output>;
  mockFallback: Output;
  modelName?: string;
}

export interface ModelGatewayResponse<Output> {
  output: Output;
  modelUsed: string;
  latencyMs: number;
  tokensUsed: number;
  usedMock: boolean;
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

  public async generateStructured<Input, Output>(
    request: ModelGatewayRequest<Input, Output>
  ): Promise<ModelGatewayResponse<Output>> {
    const startTime = Date.now();

    if (this.mode === 'mock') {
      // Simulate brief latency (100-300ms)
      await new Promise((r) => setTimeout(r, 150));
      return {
        output: request.mockFallback,
        modelUsed: 'mock-engine-v1',
        latencyMs: Date.now() - startTime,
        tokensUsed: 250,
        usedMock: true,
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
          const errText = await res.text();
          throw new Error(`OpenAI API status ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedRaw = JSON.parse(jsonText);

        const validatedOutput = request.schema.parse(parsedRaw);

        return {
          output: validatedOutput,
          modelUsed: modelName,
          latencyMs: Date.now() - startTime,
          tokensUsed: data.usage?.total_tokens || Math.ceil(text.length / 4),
          usedMock: false,
        };
      } catch (error) {
        console.warn('OpenAI generation failed, falling back to mock output:', error);
        return {
          output: request.mockFallback,
          modelUsed: 'openai-fallback-mock',
          latencyMs: Date.now() - startTime,
          tokensUsed: 0,
          usedMock: true,
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

        // Clean JSON if code block formatting returned
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedRaw = JSON.parse(jsonText);

        // Validate schema with Zod
        const validatedOutput = request.schema.parse(parsedRaw);

        return {
          output: validatedOutput,
          modelUsed: modelName,
          latencyMs: Date.now() - startTime,
          tokensUsed: Math.ceil(text.length / 4),
          usedMock: false,
        };
      } catch (error) {
        console.warn('Gemini AI generation failed, falling back to mock output:', error);
        return {
          output: request.mockFallback,
          modelUsed: 'gemini-fallback-mock',
          latencyMs: Date.now() - startTime,
          tokensUsed: 0,
          usedMock: true,
        };
      }
    }

    return {
      output: request.mockFallback,
      modelUsed: 'fallback-mock',
      latencyMs: Date.now() - startTime,
      tokensUsed: 0,
      usedMock: true,
    };
  }
}

export const modelGateway = new ModelGateway();
