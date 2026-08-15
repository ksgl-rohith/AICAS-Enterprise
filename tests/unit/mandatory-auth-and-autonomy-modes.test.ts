import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../../src/middleware';
import { autonomyEngine } from '../../src/lib/governance/autonomy-engine';
import { approvalService } from '../../src/lib/approval/approval-service';
import { campaignLifecycleOrchestrator } from '../../src/lib/workflow/campaign-lifecycle-orchestrator';
import { db } from '../../src/lib/db';
import { signSessionPayload } from '../../src/lib/auth';

describe('Mandatory Authentication Protection & Canonical Autonomy Modes', () => {
  describe('Area 2: Mandatory Route & API Authentication', () => {
    it('should redirect unauthenticated page requests on protected workspace routes to /login with redirect param', async () => {
      const protectedPaths = ['/dashboard', '/campaigns', '/brands', '/approvals', '/autonomy', '/settings', '/analytics'];

      for (const path of protectedPaths) {
        const req = new NextRequest(`http://localhost:3000${path}`);
        const res = await middleware(req);

        expect(res.status).toBe(307);
        const location = res.headers.get('location');
        expect(location).toContain('/login');
        expect(location).toContain(`redirect=${encodeURIComponent(path)}`);
      }
    });

    it('should return 401 Unauthorized JSON response for unauthenticated protected API endpoints', async () => {
      const protectedApiPaths = ['/api/campaigns', '/api/brands', '/api/approvals', '/api/workspaces', '/api/autonomy'];

      for (const path of protectedApiPaths) {
        const req = new NextRequest(`http://localhost:3000${path}`);
        const res = await middleware(req);

        expect(res.status).toBe(401);
      }
    });

    it('should allow public access to /api/auth routes without authentication', async () => {
      const publicApiPaths = ['/api/auth/login', '/api/auth/signup', '/api/auth/logout', '/api/auth/me'];

      for (const path of publicApiPaths) {
        const req = new NextRequest(`http://localhost:3000${path}`);
        const res = await middleware(req);

        expect(res.status).not.toBe(401);
      }
    });

    it('should allow authenticated requests with valid session cookie to access protected routes', async () => {
      const token = signSessionPayload({
        userId: 'usr_test_auth',
        email: 'auth_test@aicas.ai',
        name: 'Auth Test User',
        role: 'MARKETING_MANAGER',
      });

      const req = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: `aicas_session=${token}`,
        },
      });

      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });

  describe('Area 4: Campaign Autonomy Mode Real Execution Policies', () => {
    beforeEach(() => {
      process.env.ENABLE_AUTONOMOUS_PUBLISHING = 'true';
    });

    it('COPILOT Mode: strictly requires human approval and marks item for human review', async () => {
      const evalRes = await autonomyEngine.evaluatePublishingAutonomy({
        tenantId: 'tenant-default',
        brandId: 'brand_test_copilot',
        contentItemId: 'item_copilot_1',
        oversightMode: 'COPILOT',
        riskScore: 5,
        factualConfidence: 0.98,
        brandScore: 95,
        duplicateSimilarity: 0.0,
        contentType: 'text_post',
        connectorStatus: 'CONNECTED',
        availableBudget: true,
      });

      expect(evalRes.canAutoPublish).toBe(false);
      expect(evalRes.requiresHumanApproval).toBe(true);
      expect(evalRes.modeEvaluated).toBe('COPILOT');
      expect(evalRes.reasons.some((r) => r.includes('Copilot mode'))).toBe(true);
    });

    it('APPROVAL_REQUIRED Mode: holds all items in review queue awaiting explicit approval click', async () => {
      const evalRes = await autonomyEngine.evaluatePublishingAutonomy({
        tenantId: 'tenant-default',
        brandId: 'brand_test_approval',
        contentItemId: 'item_approval_1',
        oversightMode: 'APPROVAL_REQUIRED',
        riskScore: 8,
        factualConfidence: 0.95,
        brandScore: 92,
        duplicateSimilarity: 0.02,
        contentType: 'image_post',
        connectorStatus: 'CONNECTED',
        availableBudget: true,
      });

      expect(evalRes.canAutoPublish).toBe(false);
      expect(evalRes.requiresHumanApproval).toBe(true);
      expect(evalRes.modeEvaluated).toBe('APPROVAL_REQUIRED');
      expect(evalRes.reasons.some((r) => r.includes('APPROVAL_REQUIRED'))).toBe(true);
    });

    it('RISK_BASED Mode: auto-approves safe content and gates high-risk / low-brand-score content', async () => {
      // Safe content
      const safeEval = await autonomyEngine.evaluatePublishingAutonomy({
        tenantId: 'tenant-default',
        brandId: 'brand_test_risk_safe',
        contentItemId: 'item_safe_1',
        oversightMode: 'RISK_BASED',
        riskScore: 12,
        factualConfidence: 0.90,
        brandScore: 90,
        duplicateSimilarity: 0.10,
        contentType: 'text_post',
        connectorStatus: 'CONNECTED',
        availableBudget: true,
      });

      expect(safeEval.canAutoPublish).toBe(true);
      expect(safeEval.requiresHumanApproval).toBe(false);

      // Risky content (riskScore > 20)
      const riskyEval = await autonomyEngine.evaluatePublishingAutonomy({
        tenantId: 'tenant-default',
        brandId: 'brand_test_risk_high',
        contentItemId: 'item_risky_1',
        oversightMode: 'RISK_BASED',
        riskScore: 35,
        factualConfidence: 0.80,
        brandScore: 80,
        duplicateSimilarity: 0.05,
        contentType: 'text_post',
        connectorStatus: 'CONNECTED',
        availableBudget: true,
      });

      expect(riskyEval.canAutoPublish).toBe(false);
      expect(riskyEval.requiresHumanApproval).toBe(true);
      expect(riskyEval.reasons.some((r) => r.includes('Risk score'))).toBe(true);
    });

    it('FULLY_AUTOMATED / AUTONOMOUS Mode: progresses autonomously through auto-scheduling', async () => {
      const autoEval = await autonomyEngine.evaluatePublishingAutonomy({
        tenantId: 'tenant-default',
        brandId: 'brand_test_autonomous',
        contentItemId: 'item_auto_1',
        oversightMode: 'FULLY_AUTOMATED',
        riskScore: 15,
        factualConfidence: 0.92,
        brandScore: 88,
        duplicateSimilarity: 0.05,
        contentType: 'carousel',
        connectorStatus: 'CONNECTED',
        availableBudget: true,
      });

      expect(autoEval.canAutoPublish).toBe(true);
      expect(autoEval.requiresHumanApproval).toBe(false);
    });
  });
});
