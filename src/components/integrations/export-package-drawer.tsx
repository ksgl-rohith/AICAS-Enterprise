'use client';

import React, { useEffect, useState } from 'react';
import { X, Copy, Download, ExternalLink, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExportPackageDrawerProps {
  platform: string;
  brandId: string;
  onClose: () => void;
}

export function ExportPackageDrawer({ platform, brandId, onClose }: ExportPackageDrawerProps) {
  const [approvedItems, setApprovedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/approvals?brandId=${brandId}`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.items || data || [];
        const approved = Array.isArray(items) ? items : [];
        setApprovedItems(approved);
        if (approved.length > 0) setSelectedItemId(approved[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [brandId]);

  const selectedItem = approvedItems.find((i) => i.id === selectedItemId);
  const primaryVariant = selectedItem?.variants?.[0] || {};
  const fullCopy = `Title: ${selectedItem?.title || ''}\n\n${primaryVariant.hook || ''}\n\n${primaryVariant.bodyText || ''}\n\nCTA: ${primaryVariant.ctaText || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPackage = () => {
    const pkgData = {
      platform,
      brandId,
      contentItem: selectedItem,
      fullCopy,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(pkgData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICAS_Export_${platform}_${selectedItem?.title?.slice(0, 15) || 'content'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="amber" className="uppercase font-bold text-[10px]">
                Assisted Publishing / Export Package
              </Badge>
              <span className="text-xs text-slate-400 capitalize">• Target: {platform}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Export Formatted Post & Evidence Package
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300">
            <p className="font-semibold text-xs">Direct API Publishing Restricted for {platform.toUpperCase()}</p>
            <p className="mt-1 text-[11px]">
              AICAS Enterprise generates a fully formatted content package with evidence citations and media guidelines for manual posting to official {platform} web destinations.
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading approved content items...</div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-900 dark:text-white">Select Approved Content</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {approvedItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.status})
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Formatted Content Preview</span>
                    {copied && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Copied!
                      </span>
                    )}
                  </div>

                  <pre className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {fullCopy}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-900 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Content</span>
            </button>

            <button
              onClick={handleDownloadPackage}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Package</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
