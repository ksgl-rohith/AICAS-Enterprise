'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, FileText, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useWorkspace } from '@/components/workspace-context';

export default function BrandsPage() {
  const { activeWorkspace } = useWorkspace();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = (wsId?: string) => {
    setLoading(true);
    const targetWs = wsId || activeWorkspace?.id || 'tenant-default';
    fetch(`/api/brands?workspaceId=${targetWs}`)
      .then((res) => res.json())
      .then((data) => {
        setBrands(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBrands(activeWorkspace?.id);

    const handleWorkspaceChanged = (e: any) => {
      fetchBrands(e.detail?.workspaceId);
    };

    window.addEventListener('workspace-changed', handleWorkspaceChanged);
    return () => {
      window.removeEventListener('workspace-changed', handleWorkspaceChanged);
    };
  }, [activeWorkspace?.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Workspace: ${activeWorkspace?.name || 'Enterprise'}`}
        title="Brand Intelligence & Guidelines"
        description="Corporate brand DNA profiles, tone rules, prohibited terms, and ingested vector whitepapers."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Workspace' },
          { label: 'Brand Profiles' },
        ]}
        actions={
          <Link
            href="/brands/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest & Create Brand Profile</span>
          </Link>
        }
      />

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs">Loading brand profiles...</div>
      ) : brands.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={`No Brand Profiles in ${activeWorkspace?.name || 'Workspace'}`}
          description="Extract your company website URL or upload whitepaper documents to create a brand DNA profile for this workspace."
          action={
            <Link
              href="/brands/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" /> Ingest & Create Brand Profile
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">{brand.name}</h2>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{brand.industry}</span>
                    </div>
                  </div>
                  <Badge variant="indigo">{brand.region}</Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{brand.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">Personality & Tone</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">{brand.tone}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">Vector RAG Docs</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block">{brand._count?.knowledgeDocs || brand.knowledgeDocs?.length || 0} Files</span>
                  </div>
                </div>

                {brand.prohibitedPhrases && (
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2.5 rounded-xl">
                    <strong>Prohibited Terms:</strong> {brand.prohibitedPhrases}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link
                  href={`/brands/${brand.id}/knowledge`}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Manage Knowledge Base</span>
                </Link>
                <Link
                  href={`/brands/${brand.id}`}
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
                >
                  View DNA Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
