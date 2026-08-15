'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, ShieldAlert, CheckCircle2, Lock, AlertTriangle, RefreshCw, X, Radio } from 'lucide-react';

export function PublishingControlPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [publishingMode, setPublishingMode] = useState<'SIMULATED' | 'LIVE'>('SIMULATED');
  const [allowLivePublishing, setAllowLivePublishing] = useState(false);
  const [canManage, setCanManage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  const fetchPublishingMode = async () => {
    try {
      const res = await fetch('/api/publishing/mode');
      const data = await res.json();
      if (res.ok && data.success) {
        setPublishingMode(data.mode);
        setAllowLivePublishing(Boolean(data.allowLivePublishing));
        setCanManage(Boolean(data.canManage !== false));
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    fetchPublishingMode();
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const popoverWidth = Math.min(340, viewportWidth - 24);

    let left = triggerRect.right - popoverWidth;

    if (left < 12) {
      left = 12;
    } else if (left + popoverWidth > viewportWidth - 12) {
      left = viewportWidth - popoverWidth - 12;
    }

    const top = triggerRect.bottom + 8;

    setPositionStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      zIndex: 50,
    });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const switchPublishingMode = async (targetMode: 'SIMULATED' | 'LIVE') => {
    setLoading(true);
    setShowConfirmModal(false);
    try {
      const res = await fetch('/api/publishing/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPublishingMode(data.mode);
      } else {
        alert(data.error || 'Failed to update publishing mode.');
      }
    } catch {
      alert('Error updating publishing mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = () => {
    if (publishingMode === 'SIMULATED') {
      if (!allowLivePublishing) {
        alert('Live publishing unavailable in this environment. Deployment safety policy ALLOW_LIVE_PUBLISHING is set to false.');
        return;
      }
      setShowConfirmModal(true);
    } else {
      switchPublishingMode('SIMULATED');
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Publishing Mode Control"
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-xs min-h-[32px] ${
          publishingMode === 'LIVE'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
        }`}
      >
        <Radio className={`w-3.5 h-3.5 shrink-0 ${publishingMode === 'LIVE' ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
        <span className="text-[11px] font-mono whitespace-nowrap">
          <span className="hidden sm:inline">Publishing: </span>
          <strong className="uppercase">{publishingMode === 'LIVE' ? 'LIVE' : 'SANDBOX'}</strong>
        </span>
      </button>

      {/* Collision-Safe Anchored Popover Content */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={positionStyle}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 text-xs animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Governed Publishing Control</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close popover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Workspace State</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                publishingMode === 'LIVE'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
              }`}>
                {publishingMode === 'LIVE' ? 'LIVE API PUBLISHING' : 'SIMULATED SANDBOX'}
              </span>
            </div>

            {/* Safety Precedence Audit Box */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-[10.5px]">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Infrastructure Safety Ceiling:</span>
                <span className={`font-bold flex items-center gap-1 ${allowLivePublishing ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {allowLivePublishing ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {allowLivePublishing ? 'ALLOWED' : 'BLOCKED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Workspace Access Policy:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Active Workspace Member
                </span>
              </div>
            </div>

            {!allowLivePublishing && (
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span>Live publishing is disabled by infrastructure policy (<code className="font-mono">ALLOW_LIVE_PUBLISHING=false</code>).</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleToggleClick}
              disabled={loading || (!allowLivePublishing && publishingMode === 'SIMULATED')}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                publishingMode === 'SIMULATED'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{publishingMode === 'SIMULATED' ? 'Enable Live Publishing' : 'Switch to Simulated Sandbox'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Enable Live Platform Publishing?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Workspace Governed Publisher Mode Switch</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
              Approved publishing actions in this workspace will be sent directly to connected real platform accounts (LinkedIn, Meta, Telegram API).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => switchPublishingMode('LIVE')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Confirm & Enable Live Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
