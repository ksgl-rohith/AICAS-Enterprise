import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { resolveAuthorizedWorkspace, WorkspaceAuthError } from '@/lib/workspace-auth';
import { GET as brandsGetHandler, POST as brandsPostHandler } from '@/app/api/brands/route';
import { GET as brandIdGetHandler, PUT as brandIdPutHandler, DELETE as brandIdDeleteHandler } from '@/app/api/brands/[id]/route';
import { GET as campaignsGetHandler, POST as campaignsPostHandler } from '@/app/api/campaigns/route';
import { GET as campaignIdGetHandler } from '@/app/api/campaigns/[id]/route';
import { GET as analyticsGetHandler } from '@/app/api/analytics/route';
import { GET as schedulesGetHandler } from '@/app/api/schedules/route';
import { GET as approvalsGetHandler } from '@/app/api/approvals/route';
import { db } from '@/lib/db';
import { signSessionPayload } from '@/lib/auth';

describe('Strict Multi-Tenant Workspace Data Isolation & Brand Persistence', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(db.auditEvent, 'create').mockResolvedValue({ id: 'evt_mock' } as any);
  });

  const userA = {
    id: 'usr_tenant_a',
    name: 'Alice Owner',
    email: 'alice@tenant-a.com',
    role: 'MARKETING_MANAGER',
    status: 'ACTIVE',
  };

  const userB = {
    id: 'usr_tenant_b',
    name: 'Bob Competitor',
    email: 'bob@tenant-b.com',
    role: 'MARKETING_MANAGER',
    status: 'ACTIVE',
  };

  const wsA = {
    id: 'ws_tenant_a_100',
    name: 'Tenant A Enterprise',
    code: 'TENANT-A',
    description: 'Tenant A Workspace',
  };

  const wsB = {
    id: 'ws_tenant_b_200',
    name: 'Tenant B Competitor Org',
    code: 'TENANT-B',
    description: 'Tenant B Workspace',
  };

  const tokenA = signSessionPayload({
    userId: userA.id,
    email: userA.email,
    name: userA.name,
    role: userA.role,
  });

  const tokenB = signSessionPayload({
    userId: userB.id,
    email: userB.email,
    name: userB.name,
    role: userB.role,
  });

  describe('Part 1: Workspace Authorization Resolver (resolveAuthorizedWorkspace)', () => {
    it('throws 401 when no session token is provided', async () => {
      const req = new NextRequest('http://localhost/api/brands');
      await expect(resolveAuthorizedWorkspace(req)).rejects.toThrow(WorkspaceAuthError);
    });

    it('rejects access with 403 when User A attempts to access Workspace B', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(userA as any);
      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/brands', {
        headers: { cookie: `aicas_session=${tokenA}` },
      });

      await expect(resolveAuthorizedWorkspace(req, wsB.id)).rejects.toThrow(
        `Forbidden: You are not an authorized member of workspace "${wsB.id}"`
      );
    });

    it('resolves authorized workspace when User A requests Workspace A', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(userA as any);
      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue({
        id: 'mem_a_1',
        workspaceId: wsA.id,
        userId: userA.id,
        role: 'WORKSPACE_OWNER',
        workspace: wsA,
      } as any);

      const req = new NextRequest('http://localhost/api/brands', {
        headers: { cookie: `aicas_session=${tokenA}` },
      });

      const res = await resolveAuthorizedWorkspace(req, wsA.id);
      expect(res.userId).toBe(userA.id);
      expect(res.workspaceId).toBe(wsA.id);
      expect(res.workspace.name).toBe(wsA.name);
    });
  });

  describe('Part 2: Brand Persistence & Tenant Isolation', () => {
    it('creates Brand with persistent workspaceId and userId', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(userA as any);
      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue({
        id: 'mem_a_1',
        workspaceId: wsA.id,
        userId: userA.id,
        role: 'WORKSPACE_OWNER',
        workspace: wsA,
      } as any);

      const createdBrand = {
        id: 'brand_new_1',
        userId: userA.id,
        workspaceId: wsA.id,
        name: 'Apex AI Software',
        industry: 'Enterprise AI',
      };

      vi.spyOn(db.brand, 'findFirst').mockResolvedValue(null);
      vi.spyOn(db.brand, 'findMany').mockResolvedValue([]);
      vi.spyOn(db.brand, 'create').mockResolvedValue(createdBrand as any);

      const req = new NextRequest('http://localhost/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `aicas_session=${tokenA}`,
        },
        body: JSON.stringify({
          name: 'Apex AI Software',
          industry: 'Enterprise AI',
          workspaceId: wsA.id,
        }),
      });

      const res = await brandsPostHandler(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(db.brand.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: userA.id,
            workspaceId: wsA.id,
            name: 'Apex AI Software',
          }),
        })
      );
      expect(data.id).toBe('brand_new_1');
      expect(data.workspaceId).toBe(wsA.id);
    });

    it('scopes GET /api/brands strictly to authorized workspace', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(userA as any);
      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue({
        id: 'mem_a_1',
        workspaceId: wsA.id,
        userId: userA.id,
        role: 'WORKSPACE_OWNER',
        workspace: wsA,
      } as any);

      const brandA = {
        id: 'brand_a_1',
        name: 'Tenant A Brand',
        workspaceId: wsA.id,
        userId: userA.id,
        _count: { knowledgeDocs: 2, campaigns: 1, platformConnections: 1 },
      };

      vi.spyOn(db.brand, 'findMany').mockResolvedValue([brandA] as any);

      const req = new NextRequest(`http://localhost/api/brands?workspaceId=${wsA.id}`, {
        headers: { cookie: `aicas_session=${tokenA}` },
      });

      const res = await brandsGetHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Tenant A Brand');
      expect(db.brand.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { workspaceId: wsA.id },
            ]),
          }),
        })
      );
    });

    it('rejects cross-tenant GET /api/brands/[id] with 403 Forbidden', async () => {
      // User B tries to access User A's brand
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(userB as any);
      vi.spyOn(db.workspaceMembership, 'findFirst').mockResolvedValue({
        id: 'mem_b_1',
        workspaceId: wsB.id,
        userId: userB.id,
        role: 'WORKSPACE_OWNER',
        workspace: wsB,
      } as any);

      // Brand belongs to wsA and userA
      vi.spyOn(db.brand, 'findUnique').mockResolvedValue({
        id: 'brand_a_secret',
        name: 'Confidential Tenant A IP',
        workspaceId: wsA.id,
        userId: userA.id,
      } as any);

      const req = new NextRequest('http://localhost/api/brands/brand_a_secret', {
        headers: { cookie: `aicas_session=${tokenB}` },
      });

      const res = await brandIdGetHandler(req, { params: { id: 'brand_a_secret' } });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });
  });

  describe('Part 3: Campaign Multi-Tenant Isolation', () => {
    it('rejects creating a Campaign under a foreign workspace brand with 403', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(userB as any);
      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue({
        id: 'mem_b_1',
        workspaceId: wsB.id,
        userId: userB.id,
        role: 'WORKSPACE_OWNER',
        workspace: wsB,
      } as any);

      // Brand belongs to wsA
      vi.spyOn(db.brand, 'findUnique').mockResolvedValue({
        id: 'brand_a_1',
        workspaceId: wsA.id,
        userId: userA.id,
      } as any);

      const req = new NextRequest('http://localhost/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `aicas_session=${tokenB}`,
        },
        body: JSON.stringify({
          brandId: 'brand_a_1',
          name: 'Unauthorized Cross-Tenant Campaign',
          workspaceId: wsB.id,
        }),
      });

      const res = await campaignsPostHandler(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain('Forbidden: Access denied to create campaign for brand in another workspace');
    });

    it('rejects cross-tenant GET /api/campaigns/[id] with 403 Forbidden', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(userB as any);
      vi.spyOn(db.workspaceMembership, 'findFirst').mockResolvedValue({
        id: 'mem_b_1',
        workspaceId: wsB.id,
        userId: userB.id,
        role: 'WORKSPACE_OWNER',
        workspace: wsB,
      } as any);

      vi.spyOn(db.campaign, 'findUnique').mockResolvedValue({
        id: 'camp_a_private',
        name: 'Private Strategy Plan',
        brand: {
          id: 'brand_a_1',
          workspaceId: wsA.id,
          userId: userA.id,
        },
      } as any);

      const req = new NextRequest('http://localhost/api/campaigns/camp_a_private', {
        headers: { cookie: `aicas_session=${tokenB}` },
      });

      const res = await campaignIdGetHandler(req, { params: { id: 'camp_a_private' } });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toContain('Forbidden: Access denied to campaign in another workspace');
    });
  });

  describe('Part 4: Real Runtime Analytics & Clean Zero State', () => {
    it('returns zero-state metric summary when workspace has 0 publications without fallback leaks', async () => {
      vi.spyOn(db.user, 'findUnique').mockResolvedValue(userA as any);
      vi.spyOn(db.workspaceMembership, 'findUnique').mockResolvedValue({
        id: 'mem_a_1',
        workspaceId: wsA.id,
        userId: userA.id,
        role: 'WORKSPACE_OWNER',
        workspace: wsA,
      } as any);

      vi.spyOn(db.publication, 'findMany').mockResolvedValue([]);

      const req = new NextRequest(`http://localhost/api/analytics?workspaceId=${wsA.id}`, {
        headers: { cookie: `aicas_session=${tokenA}` },
      });

      const res = await analyticsGetHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.summary.totalPublications).toBe(0);
      expect(data.summary.totalImpressions).toBe(0);
      expect(data.summary.avgEngagementRate).toBe(0);
      expect(data.publications).toEqual([]);
    });
  });
});
