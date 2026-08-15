import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as signupHandler } from '@/app/api/auth/signup/route';
import { GET as workspacesGetHandler, POST as workspacesPostHandler } from '@/app/api/workspaces/route';
import { GET as publishingModeGetHandler, POST as publishingModePostHandler } from '@/app/api/publishing/mode/route';
import { db } from '@/lib/db';
import { hashPassword, signSessionPayload } from '@/lib/auth';
import { connectorCapabilityRegistry, CONNECTOR_CAPABILITIES } from '@/lib/connectors/connector-capability-registry';

describe('Production Quality Improvements Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(db.auditEvent, 'create').mockResolvedValue({ id: 'evt_mock' } as any);
  });

  describe('Part 1: Canonical Connector Capability Registry & Campaign Platforms', () => {
    it('exposes all 13 canonical platform capabilities', () => {
      const allCaps = connectorCapabilityRegistry.getAllCapabilities();
      expect(allCaps.length).toBe(13);

      const platforms = allCaps.map((c) => c.platform);
      expect(platforms).toContain('linkedin');
      expect(platforms).toContain('facebook');
      expect(platforms).toContain('instagram');
      expect(platforms).toContain('x');
      expect(platforms).toContain('threads');
      expect(platforms).toContain('tiktok');
      expect(platforms).toContain('youtube');
      expect(platforms).toContain('telegram');
      expect(platforms).toContain('pinterest');
      expect(platforms).toContain('reddit');
      expect(platforms).toContain('quora');
      expect(platforms).toContain('wordpress');
      expect(platforms).toContain('website');
    });

    it('accurately distinguishes direct live publishing vs export-only vs approval required', () => {
      const linkedin = connectorCapabilityRegistry.getCapability('linkedin');
      expect(linkedin?.publishing).toBe(true);
      expect(linkedin?.status).toBe('AVAILABLE');

      const quora = connectorCapabilityRegistry.getCapability('quora');
      expect(quora?.status).toBe('EXPORT_ONLY');
      expect(quora?.authenticationType).toBe('manual_export');

      const wordpress = connectorCapabilityRegistry.getCapability('wordpress');
      expect(wordpress?.status).toBe('EXPORT_ONLY');

      const tiktok = connectorCapabilityRegistry.getCapability('tiktok');
      expect(tiktok?.status).toBe('API_APPROVAL_REQUIRED');

      const website = connectorCapabilityRegistry.getCapability('website');
      expect(website?.status).toBe('AVAILABLE');
      expect(website?.authenticationType).toBe('webhook');
    });
  });

  describe('Part 2: Workspace Creation on Signup', () => {
    it('creates User, Workspace, and WorkspaceMembership atomically with WORKSPACE_OWNER role', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(null);

      const mockTx = {
        user: {
          create: vi.fn().mockResolvedValue({
            id: 'usr_new_1',
            name: 'KandVate Partner',
            email: 'partner@kandvate.law',
            role: 'MARKETING_MANAGER',
            status: 'ACTIVE',
          }),
        },
        workspace: {
          create: vi.fn().mockResolvedValue({
            id: 'ws_kandvate_1',
            name: 'KandVate Legal Advisory',
            code: 'KANDVATE-7A2F',
            description: 'KandVate Legal Advisory multi-agent campaign orchestration & governance workspace.',
            industry: 'Legal Services',
            website: 'https://kandvate.law',
            companySize: '50-250',
          }),
        },
        workspaceMembership: {
          create: vi.fn().mockResolvedValue({
            id: 'mem_1',
            workspaceId: 'ws_kandvate_1',
            userId: 'usr_new_1',
            role: 'WORKSPACE_OWNER',
          }),
        },
        userPreferences: {
          create: vi.fn().mockResolvedValue({
            id: 'pref_1',
            userId: 'usr_new_1',
          }),
        },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (cb: any) => cb(mockTx));

      const req = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'KandVate Partner',
          email: 'partner@kandvate.law',
          password: 'SecureLegalPassword@2026',
          confirmPassword: 'SecureLegalPassword@2026',
          workspaceName: 'KandVate Legal Advisory',
          industry: 'Legal Services',
          website: 'https://kandvate.law',
          companySize: '50-250',
        }),
      });

      const res = await signupHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('partner@kandvate.law');
      expect(data.workspace.name).toBe('KandVate Legal Advisory');
      expect(data.workspace.role).toBe('WORKSPACE_OWNER');

      // Verify transaction calls
      expect(mockTx.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'KandVate Legal Advisory',
            industry: 'Legal Services',
            website: 'https://kandvate.law',
          }),
        })
      );
      expect(mockTx.workspaceMembership.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'usr_new_1',
            role: 'WORKSPACE_OWNER',
          }),
        })
      );
    });

    it('rejects signup if workspaceName is missing or passwords mismatch', async () => {
      const req = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
        }),
      });

      const res = await signupHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Passwords do not match');
    });
  });

  describe('Part 3: Authenticated Workspace Workspaces API', () => {
    it('returns real user workspaces based on database memberships', async () => {
      const token = signSessionPayload({
        userId: 'usr_std_99',
        email: 'user@enterprise.com',
        name: 'Enterprise User',
        role: 'MARKETING_MANAGER',
      });

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'usr_std_99',
        name: 'Enterprise User',
        role: 'MARKETING_MANAGER',
        status: 'ACTIVE',
      } as any);

      vi.spyOn(db.workspaceMembership, 'findMany').mockResolvedValue([
        {
          id: 'mem_99',
          workspaceId: 'ws_custom_99',
          userId: 'usr_std_99',
          role: 'WORKSPACE_OWNER',
          workspace: {
            id: 'ws_custom_99',
            name: 'Custom Org Workspace',
            code: 'CUSTOM-ORG',
            description: 'Custom Org Workspace',
          },
        },
      ] as any);

      const req = new NextRequest('http://localhost/api/workspaces', {
        headers: { cookie: `aicas_session=${token}` },
      });

      const res = await workspacesGetHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.workspaces.length).toBe(1);
      expect(data.workspaces[0].name).toBe('Custom Org Workspace');
      expect(data.workspaces[0].role).toBe('WORKSPACE_OWNER');
    });

    it('rejects unauthenticated requests to /api/workspaces with 401', async () => {
      const req = new NextRequest('http://localhost/api/workspaces');
      const res = await workspacesGetHandler(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Part 4: Publishing Mode Permissions & Infrastructure Safety', () => {
    it('allows authenticated workspace member to switch mode when ALLOW_LIVE_PUBLISHING=true', async () => {
      process.env.ALLOW_LIVE_PUBLISHING = 'true';

      const token = signSessionPayload({
        userId: 'usr_member_1',
        email: 'member@enterprise.com',
        name: 'Workspace Member',
        role: 'MARKETING_MANAGER', // Non-admin standard member
      });

      vi.spyOn(db.userPreferences, 'findUnique').mockResolvedValue({
        publishingMode: 'SIMULATED',
      } as any);
      vi.spyOn(db.userPreferences, 'upsert').mockResolvedValue({} as any);
      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue({
        id: 'mem_1',
        workspaceId: 'ws_valid_1',
        userId: 'usr_member_1',
        role: 'MEMBER',
      } as any);

      const req = new NextRequest('http://localhost/api/publishing/mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `aicas_session=${token}`,
        },
        body: JSON.stringify({
          mode: 'LIVE',
          workspaceId: 'ws_valid_1',
        }),
      });

      const res = await publishingModePostHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('LIVE');
    });

    it('strictly blocks Live mode when ALLOW_LIVE_PUBLISHING=false even for authenticated users', async () => {
      process.env.ALLOW_LIVE_PUBLISHING = 'false';

      const token = signSessionPayload({
        userId: 'usr_member_1',
        email: 'member@enterprise.com',
        name: 'Workspace Member',
        role: 'MARKETING_MANAGER',
      });

      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue({
        id: 'mem_1',
        workspaceId: 'ws_valid_1',
        userId: 'usr_member_1',
        role: 'WORKSPACE_OWNER',
      } as any);

      const req = new NextRequest('http://localhost/api/publishing/mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `aicas_session=${token}`,
        },
        body: JSON.stringify({
          mode: 'LIVE',
          workspaceId: 'ws_valid_1',
        }),
      });

      const res = await publishingModePostHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('ALLOW_LIVE_PUBLISHING is set to false');
      expect(data.mode).toBe('SIMULATED');
    });

    it('rejects cross-workspace publishing mode change attempts with 403 Forbidden', async () => {
      process.env.ALLOW_LIVE_PUBLISHING = 'true';

      const token = signSessionPayload({
        userId: 'usr_alien_1',
        email: 'alien@other-company.com',
        name: 'Alien User',
        role: 'MARKETING_MANAGER',
      });

      // User has no membership in ws_foreign_99
      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/publishing/mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `aicas_session=${token}`,
        },
        body: JSON.stringify({
          mode: 'LIVE',
          workspaceId: 'ws_foreign_99',
        }),
      });

      const res = await publishingModePostHandler(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });
  });
});
