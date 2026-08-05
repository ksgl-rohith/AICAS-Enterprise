'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Loader2,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status:
    | 'selected'
    | 'uploading'
    | 'uploaded'
    | 'extracting'
    | 'chunking'
    | 'indexing'
    | 'ready'
    | 'failed';
  error?: string;
  title?: string;
  extractedText?: string;
  chunkCount?: number;
}

interface BrandDocumentUploaderProps {
  files: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
}

export function BrandDocumentUploader({
  files,
  onChange,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
}: BrandDocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/x-markdown'];
  const allowedExtensions = ['.pdf', '.txt', '.md', '.markdown'];

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return `Unsupported file format "${ext}". Supported formats: PDF, TXT, MD.`;
    }

    if (file.size > maxSizeBytes) {
      return `File "${file.name}" exceeds the maximum 10MB limit.`;
    }

    if (file.size === 0) {
      return `File "${file.name}" is empty (0 bytes).`;
    }

    const isDuplicate = files.some(
      (f) => f.name === file.name && f.size === file.size
    );
    if (isDuplicate) {
      return `File "${file.name}" has already been selected.`;
    }

    return null;
  };

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    setValidationError(null);
    const newItems: UploadedFileItem[] = [];
    const fileArray = Array.from(incomingFiles);

    if (files.length + fileArray.length > maxFiles) {
      setValidationError(`Maximum ${maxFiles} documents allowed per brand profile.`);
      return;
    }

    for (const file of fileArray) {
      const err = validateFile(file);
      if (err) {
        setValidationError(err);
        continue;
      }

      newItems.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'txt',
        status: 'selected',
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      });
    }

    if (newItems.length > 0) {
      onChange([...files, ...newItems]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  const handleTitleChange = (id: string, title: string) => {
    onChange(
      files.map((f) => (f.id === id ? { ...f, title } : f))
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`p-6 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
            : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-indigo-400 dark:hover:border-indigo-800'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.markdown"
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Drag & Drop Corporate Brand Knowledge Documents
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Supported formats: <strong className="text-indigo-600 dark:text-indigo-400">PDF, Markdown (.md), TXT</strong> (Max 10MB per file)
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Browse Local Files
          </button>
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center justify-between">
            <span>Staged Knowledge Sources ({files.length}/{maxFiles})</span>
            <span className="text-[10px] text-indigo-500">Grounding RAG Ready</span>
          </label>

          <div className="space-y-2">
            {files.map((item) => {
              const ext = item.name.split('.').pop()?.toLowerCase();
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      {ext === 'pdf' ? <FileText className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => handleTitleChange(item.id, e.target.value)}
                          placeholder="Document Title"
                          className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none truncate"
                        />
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono shrink-0">
                          {ext}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{formatFileSize(item.size)}</span>
                        <span>•</span>
                        <span className="capitalize font-medium flex items-center gap-1">
                          {item.status === 'ready' && (
                            <span className="text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ready for RAG
                            </span>
                          )}
                          {item.status === 'failed' && (
                            <span className="text-red-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Ingestion Failed
                            </span>
                          )}
                          {(item.status === 'uploading' || item.status === 'extracting' || item.status === 'chunking') && (
                            <span className="text-indigo-500 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                            </span>
                          )}
                          {item.status === 'selected' && (
                            <span className="text-slate-400">Staged for ingestion</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove document ${item.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
