# Production Deployment Plan - AICAS Enterprise Platform

This document outlines the comprehensive strategy and step-by-step roadmap to deploy the **AICAS Enterprise / AICAS Lite** application from a local development setup to a production-grade environment.

---

## 1. Architecture & Tech Stack Identification

- **Framework**: Next.js 14.2.15 (App Router with TypeScript, React 18, Tailwind CSS, Zod).
- **Package Manager**: `npm` (`package-lock.json` lockfile present).
- **Database & ORM**: Prisma ORM with SQLite (`file:./dev.db`) in development. PostgreSQL is recommended for cloud production.
- **AI Integrations**: Multimodal SDKs (`@google/generative-ai` & OpenAI API).
- **Runtime Environment**: Node.js 18.x or 20.x LTS.
- **Architecture Type**: Full-stack Next.js web application (Server Components, API Route Handlers, Client Components).

---

## 2. Required Environment Variables

| Variable Name | Required | Default / Example | Purpose & Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Enables Next.js production optimizations. |
| `APP_URL` | Yes | `https://aicas.yourdomain.com` | Public canonical base URL for OAuth callbacks and asset links. |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/aicas` | Connection string for production database (PostgreSQL recommended). |
| `AI_MODE` | Yes | `gemini` or `openai` | Active AI provider (`openai`, `gemini`, or `mock`). |
| `OPENAI_API_KEY` | Optional | `sk-proj-...` | Required if `AI_MODE=openai`. |
| `OPENAI_TEXT_MODEL` | Optional | `gpt-4o-mini` | Default OpenAI model for copy generation & analysis. |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Required if `AI_MODE=gemini`. |
| `GEMINI_TEXT_MODEL` | Optional | `gemini-2.5-flash` | Default Gemini text model. |
| `PUBLISHING_MODE` | Yes | `live` or `simulated` | Controls publishing engine mode (`simulated`, `live`, `hybrid`). |
| `ALLOW_LIVE_PUBLISHING` | Yes | `true` | Master switch for enabling actual social platform publishing. |
| `ALLOW_PUBLISH_NOW` | Yes | `true` | Enables immediate publishing from UI. |
| `ALLOW_SCHEDULED_LIVE_PUBLISHING` | Yes | `true` | Enables background runner to publish scheduled posts. |
| `FALLBACK_TO_SIMULATOR` | Yes | `true` | Fallback to sandbox simulation if live API credentials fail. |
| `OAUTH_STATE_SECRET` | **CRITICAL** | High-entropy secret | Secret string to sign and verify OAuth CSRF state parameters. |
| `PLATFORM_TOKEN_ENCRYPTION_KEY` | **CRITICAL** | 32-byte hex string | 256-bit AES-GCM key used to encrypt/decrypt stored OAuth tokens. |
| `LINKEDIN_ENABLED` | Optional | `true` / `false` | Enables official LinkedIn OAuth 2.0 connector. |
| `LINKEDIN_CLIENT_ID` | Optional | `78...` | LinkedIn Developer App Client ID. |
| `LINKEDIN_CLIENT_SECRET` | Optional | `Wk...` | LinkedIn Developer App Client Secret. |
| `LINKEDIN_REDIRECT_URI` | Optional | `https://<domain>/api/integrations/linkedin/callback` | Configured OAuth redirect URI for LinkedIn. |
| `FACEBOOK_ENABLED` | Optional | `true` / `false` | Enables Meta Graph API connector (Facebook & Instagram). |
| `META_APP_ID` | Optional | `123456789` | Meta Developer App ID. |
| `META_APP_SECRET` | Optional | `ab123...` | Meta Developer App Secret. |
| `FACEBOOK_REDIRECT_URI` | Optional | `https://<domain>/api/integrations/facebook/callback` | Configured OAuth redirect URI for Meta. |
| `TELEGRAM_ENABLED` | Optional | `true` / `false` | Enables Telegram Bot API connector. |
| `TELEGRAM_BOT_TOKEN` | Optional | `123456:ABC-DEF...` | Telegram Bot API token generated via `@BotFather`. |
| `TELEGRAM_CHAT_ID` | Optional | `@your_channel` | Target Telegram channel or chat ID. |

---

## 3. Production Readiness Assessment

> [!WARNING]
> **Database Choice**: Development uses SQLite (`dev.db`). Standard SQLite is file-based and ephemeral in serverless environments like Vercel or standard container instances without attached persistent volumes. For cloud deployment, migrating Prisma schema to **PostgreSQL** (e.g. Supabase, Neon, Railway Postgres, RDS) is strongly recommended.

> [!IMPORTANT]
> **Secret Key Hardcoding Risk**: Development fallbacks in `src/lib/env.ts` use generic string defaults (`aicas_super_secret_state_token_key_12345`). Production environments MUST set explicit, secure random 256-bit keys for `OAUTH_STATE_SECRET` and `PLATFORM_TOKEN_ENCRYPTION_KEY`.

---

## 4. Recommended Deployment Platforms

### Option A: Vercel + Managed PostgreSQL (Recommended for Serverless)
- **Host**: Vercel (Native Next.js platform with zero config for SSR, static optimization, edge functions).
- **Database**: Supabase / Neon / Railway PostgreSQL.
- **Cron Jobs**: Vercel Cron (`cron.json`) to periodically ping scheduled publishing endpoints.

### Option B: Railway / Render / DigitalOcean App Platform (Recommended for Containerized Setup)
- **Host**: Containerized runner (Docker).
- **Database**: Managed PostgreSQL container or managed cloud database.
- **Cron Jobs**: Native worker service running `node` or internal `cron` job scheduler.

---

## 5. Database Migrations & Initialization Steps

1. **Schema Migration for Production**:
   - Update `prisma/schema.prisma` datasource provider to `postgresql` (or keep `sqlite` with a mounted persistent volume).
2. **Execute Schema Sync**:
   ```bash
   npx prisma generate
   npx prisma db push
   # OR for migration history:
   # npx prisma migrate deploy
   ```
3. **Database Seeding**:
   ```bash
   npm run db:seed
   ```

---

## 6. Static Assets, Background Workers & API Routes Handling

- **Static Assets**: Automatically optimized by Next.js and served via global CDN edge caches.
- **API Routes**: Next.js App Router API routes (`/api/...`) run automatically as serverless handlers or server endpoints.
- **Scheduled Publishing Jobs**: AICAS Enterprise relies on periodic triggers to process scheduled social media posts. In production:
  - Configure a external/platform Cron (e.g., **Vercel Cron** or **GitHub Actions Cron**) to trigger `GET https://aicas.yourdomain.com/api/publishing/process` every 5-15 minutes with a secret authorization header.

---

## 7. Social Connector Verification (LinkedIn, Meta, Telegram)

| Platform | Requirements for Production | Status / Verification Steps |
|---|---|---|
| **LinkedIn** | • LinkedIn Developer App in Live Mode<br>• Approved scopes: `w_member_social`, `w_organization_social`<br>• Exact matching `LINKEDIN_REDIRECT_URI` | Requires HTTPS domain in production callback URL. Encrypted tokens stored safely in `PlatformConnection`. |
| **Meta (FB & IG)** | • Meta Developer App switched from Development to Live Mode<br>• Verified Business Manager<br>• Permissions: `pages_manage_posts`, `instagram_content_publish` | Requires Meta App Review approval and SSL certificate on `APP_URL`. |
| **Telegram** | • Token from `@BotFather`<br>• Bot added as Administrator to channel with posting rights | Bot token ready for immediate live operation once credentials are set. |

---

## 8. Security Audit & Deployment Blockers

1. **HTTPS Requirement**: OAuth 2.0 callbacks for LinkedIn and Meta strictly require HTTPS URLs.
2. **Secret Encryption Key**: `PLATFORM_TOKEN_ENCRYPTION_KEY` must be exactly 32 bytes (64 hex characters) to ensure AES-256-GCM encryption works seamlessly without runtime errors.
3. **API Keys**: Ensure `OPENAI_API_KEY` or `GEMINI_API_KEY` has active production quota and rate limits configured.

---

## 9. Docker Configuration

Created production container setup files:
- [Dockerfile](file:///c:/Users/SaiGanaLaxmiRohith/Documents/GitHub/AICAS-Enterprise/Dockerfile)
- [docker-compose.yml](file:///c:/Users/SaiGanaLaxmiRohith/Documents/GitHub/AICAS-Enterprise/docker-compose.yml)
- [.dockerignore](file:///c:/Users/SaiGanaLaxmiRohith/Documents/GitHub/AICAS-Enterprise/.dockerignore)

---

## 10. CI/CD GitHub Actions Workflow

Created continuous integration pipeline file:
- [.github/workflows/deploy.yml](file:///c:/Users/SaiGanaLaxmiRohith/Documents/GitHub/AICAS-Enterprise/.github/workflows/deploy.yml)

---

## 11. Verification & Production Deployment Checklist

### Pre-Deployment Checklist
- [ ] Production database created (PostgreSQL or persistent SQLite volume).
- [ ] Cryptographic 32-byte secret generated for `PLATFORM_TOKEN_ENCRYPTION_KEY`.
- [ ] OAuth App callback URLs registered with LinkedIn, Meta, and Telegram.
- [ ] AI API keys configured with sufficient production quotas.
- [ ] Automated tests and TypeScript typechecks passing clean (`npm run typecheck && npm test`).

### Deployment Execution Checklist
- [ ] Push codebase and environment variables to deployment platform (Vercel / Railway / Docker host).
- [ ] Run database migration (`npx prisma db push`).
- [ ] Run seed script if initializing a fresh database (`npm run db:seed`).
- [ ] Configure periodic cron job for `/api/publishing/process`.

### Post-Deployment Verification Checklist
- [ ] Verify homepage and dashboard load over HTTPS without SSL or CORS warnings.
- [ ] Test brand creation and knowledge ingestion endpoint.
- [ ] Verify AI copy generation studio using active AI key.
- [ ] Test simulated social post publishing and check audit log.
