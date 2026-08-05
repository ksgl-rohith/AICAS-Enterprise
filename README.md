# AICAS Lite - Autonomous Social Content Intelligence Platform

AICAS Lite is an autonomous multi-agent content intelligence, creation, review, scheduling, publishing, and analytics prototype based on the enterprise vision in [README_ENTERPRISE.md](file:///c:/Users/SaiGanaLaxmiRohith/Desktop/AICAS%20Prototype/README_ENTERPRISE.md).

## Core Capabilities
- **Multi-Brand & Brand DNA Setup**: Tone rules, preferred vocabulary, prohibited phrases, disclaimers (`/brands`).
- **Grounded Knowledge Ingestion (RAG)**: Ingest PDFs, TXT, and Markdown whitepapers into vector chunks (`/brands/[id]/knowledge`).
- **Multi-Step Campaign Wizard**: Goal selection, audience definition, cross-channel target setup (`/campaigns/new`).
- **AI Strategy & Multimodal Copy Studio**: Multi-agent strategy narrative, pillars, channel roles, and copy generation for LinkedIn, Facebook Pages, Instagram, and Telegram (`/campaigns/[id]/strategy`, `/campaigns/[id]/content`).
- **Deterministic Quality Review Council**: Brand alignment score (0-100), factual risk (0-100), compliance score (0-100), prohibited phrase detection, and disclaimer validation (`/approvals`).
- **Real-Time Social API Connectors**: Official LinkedIn OAuth 2.0 API connector (`/rest/posts`), Meta Graph API connector (Facebook Pages & Instagram Business), and Telegram Bot API connector with AES-256-GCM token encryption and simulated sandbox fallback (`/settings/integrations`).
- **Calendar & Schedule Orchestration**: Collision prevention, instant publishing, and scheduled trigger queue (`/calendar`).
- **Analytics & Strategic Recommendations**: Normalized metrics, channel breakdown, pillar attribution, 7-day metric simulation, and next-post AI recommendations (`/analytics`).
- **Immutable Audit Trail**: System activity event ledger (`/activity`).

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env` (or copy `.env.example`):
```bash
cp .env.example .env
```

### 3. Setup Database & Seed Initial Data
```bash
npm run db:setup
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Tests & Verification
```bash
# Run Unit Tests
npm test

# Run TypeScript Typecheck
npm run typecheck
```

---

## Disclaimer
> "AICAS Lite is a demonstration system. Generated content, review scores, recommendations and predicted results require human review and are not legal, regulatory or guaranteed performance conclusions."
