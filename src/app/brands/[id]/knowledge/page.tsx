'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Search,
  Database,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Trash2,
  FileCode,
} from 'lucide-react';
import {
  BrandDocumentUploader,
  UploadedFileItem,
} from '@/components/ui/brand-document-uploader';

export default function BrandKnowledgePage({ params }: { params: { id: string } }) {
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stagedFiles, setStagedFiles] = useState<UploadedFileItem[]>([]);
  const [manualText, setManualText] = useState('');
  const [docTitle, setDocTitle] = useState('');

  const fetchBrand = () => {
    fetch(`/api/brands/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setBrand(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBrand();
  }, [params.id]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length === 0 && !manualText) {
      alert('Please select or drag files, or enter text to ingest.');
      return;
    }

    setUploading(true);

    try {
      if (stagedFiles.length > 0) {
        for (const item of stagedFiles) {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('title', item.title || item.name);

          await fetch(`/api/brands/${params.id}/knowledge`, {
            method: 'POST',
            body: formData,
          });
        }
        setStagedFiles([]);
      } else if (manualText) {
        const formData = new FormData();
        formData.append('filename', docTitle || 'Knowledge_Notes.txt');
        formData.append('textContent', manualText);

        await fetch(`/api/brands/${params.id}/knowledge`, {
          method: 'POST',
          body: formData,
        });

        setManualText('');
        setDocTitle('');
      }

      fetchBrand();
    } catch {
      alert('Upload error during document ingestion.');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !brand) {
    return <div className="text-center py-16 text-slate-500 text-xs">Loading Grounded Knowledge Base...</div>;
  }

  const docs = brand.knowledgeDocs || [];
  const chunks = brand.knowledgeChunks || [];

  const filteredChunks = searchQuery
    ? chunks.filter((c: any) => c.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : chunks;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/brands" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Grounded RAG Knowledge Base</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {brand.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ingest corporate whitepapers, PDFs, TXT, and Markdown documents. AI agents extract and ground campaign text using these chunks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Upload Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-500" /> Ingest Documents
            </h2>
            <span className="text-xs font-semibold text-slate-400">{docs.length}/10 Files</span>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <BrandDocumentUploader
              files={stagedFiles}
              onChange={setStagedFiles}
            />

            <div className="text-center text-[10px] text-slate-400 uppercase font-semibold py-1">
              OR PASTE RAW TEXT / WHITEPAPER EXCERPT
            </div>

            <div>
              <input
                type="text"
                placeholder="Document Title (e.g. Product Specs 2026)"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <textarea
                rows={3}
                placeholder="Paste raw guidelines or whitepaper text directly..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || (stagedFiles.length === 0 && !manualText)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Extracting & Ingesting Chunks...' : 'Ingest to Vector Index'}</span>
            </button>
          </form>
        </div>

        {/* Uploaded Documents & Chunks Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" /> Ingested Brand Knowledge Sources
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Tenant Scoped</span>
            </div>

            {docs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No documents uploaded yet. Upload a PDF or TXT file above.</div>
            ) : (
              <div className="space-y-3">
                {docs.map((doc: any) => (
                  <div key={doc.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold uppercase text-[10px] shrink-0">
                        {doc.fileType || 'doc'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{doc.filename}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.charCount.toLocaleString()} chars • {doc.chunkCount} RAG chunks • Trust: VERIFIED_INTERNAL
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      PROCESSED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RAG Chunk Inspector */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Vector Knowledge Excerpts ({filteredChunks.length})
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search excerpts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {filteredChunks.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No matching knowledge chunks.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {filteredChunks.map((chunk: any) => (
                  <div key={chunk.id} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Chunk #{chunk.chunkIndex + 1}</span>
                      <span>{chunk.charCount} characters</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{chunk.content}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
