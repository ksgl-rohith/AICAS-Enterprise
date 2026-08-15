import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  AI_MODE: z.enum(['openai', 'gemini', 'mock']).default('mock'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_TEXT_MODEL: z.string().default('gpt-4o-mini'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_TEXT_MODEL: z.string().default('gemini-2.5-flash'),
  PUBLISHING_MODE: z.enum(['simulated', 'live', 'hybrid']).default('simulated'),
  ALLOW_LIVE_PUBLISHING: z.string().transform((v) => v === 'true').default('false'),
  ALLOW_PUBLISH_NOW: z.string().transform((v) => v === 'true').default('true'),
  ALLOW_SCHEDULED_LIVE_PUBLISHING: z.string().transform((v) => v === 'true').default('false'),
  FALLBACK_TO_SIMULATOR: z.string().transform((v) => v === 'true').default('true'),
  SESSION_SECRET: z.string().default('aicas_enterprise_secure_session_secret_key_32bytes'),
  OAUTH_STATE_SECRET: z.string().default('aicas_super_secret_state_token_key_12345'),
  PLATFORM_TOKEN_ENCRYPTION_KEY: z.string().default('39f847291a58c40b2e3194a8f9021c4b'),
  DEFAULT_TENANT_ID: z.string().default('tenant-enterprise-001'),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  if (!parsedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.warn('⚠️ Environment variable validation warning:', result.error.format());
      parsedEnv = envSchema.parse({});
    } else {
      parsedEnv = result.data;
    }
  }
  return parsedEnv;
}

export function redactSensitiveData(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['key', 'secret', 'password', 'token', 'auth', 'bearer', 'credential'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const isSensitive = sensitiveKeys.some((s) => key.toLowerCase().includes(s));
    if (isSensitive && typeof value === 'string' && value.length > 0) {
      sanitized[key] = `[REDACTED:${value.slice(0, 4)}...]`;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
