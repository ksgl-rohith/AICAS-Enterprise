'use client';

import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-medium flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="leading-tight">
          <strong className="font-semibold text-amber-700 dark:text-amber-300">AICAS Lite System Disclaimer:</strong>{' '}
          AICAS Lite is a demonstration system. Generated content, review scores, recommendations and predicted results require human review and are not legal, regulatory or guaranteed performance conclusions.
        </p>
      </div>
    </div>
  );
}
