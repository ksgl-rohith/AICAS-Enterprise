'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle2, Search, Database, Layers, Sparkles } from 'lucide-react';

export default function BrandKnowledgePage({ params }: { params: { id: string } }) {
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !manualText) {
      alert('Please select a PDF/Word file or paste text content.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('filename', docTitle || 'Company_Knowledge_Doc.txt');
      formData.append('textContent', manualText);
    }

    try {
      const res = await fetch(`/api/brands/${params.id}/knowledge`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setFile(null);
        setManualText('');
        setDocTitle('');
        fetchBrand();
      } else {
        alert(data.error || 'Failed to upload document.');
      }
    } catch {
      alert('Upload error.');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !brand) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading Grounded Knowledge Base...</div>;
  }

  const docs = brand.knowledgeDocs || [];
  const chunks = brand.knowledgeChunks || [];

  const filteredChunks = searchQuery
    ? chunks.filter((c: any) => c.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : chunks;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/brands" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Grounded RAG Knowledge Base</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              {brand.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ingest corporate whitepapers, PDFs, Word (.doc/.docx), TXT, and Markdown files. AI agents retrieve evidence directly from these chunks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Upload Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-500" /> Ingest Knowledge Document
            </h2>
            <span className="text-xs font-semibold text-slate-400">{docs.length}/10 Files</span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Company File (PDF, Word, TXT, MD)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>

            <div className="text-center text-[10px] text-slate-400 uppercase font-semibold">OR PASTE RAW TEXT DIRECTLY</div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g. ApexAI Product Architecture 2026.docx"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Raw Text / Whitepaper Excerpt</label>
              <textarea
                rows={4}
                placeholder="Paste company specific text, whitepapers, or disclaimers here..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Processing & Vector Chunking...' : 'Ingest Document & Vectorize'}</span>
            </button>
          </form>
        </div>

        {/* Uploaded Documents & Chunks Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" /> Ingested Brand Knowledge Documents
            </h2>

            {docs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No documents uploaded yet.</div>
            ) : (
              <div className="space-y-3">
                {docs.map((doc: any) => (
                  <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold uppercase text-[10px]">
                        {doc.fileType || 'doc'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{doc.filename}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.charCount.toLocaleString()} chars • {doc.chunkCount} RAG vector chunks
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
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Vector Knowledge Chunks ({filteredChunks.length})
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search chunk contents..."
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
                  <div key={chunk.id} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
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
