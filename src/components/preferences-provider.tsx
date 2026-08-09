'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserPreferencesData {
  theme: string;
  density: string;
  sidebarDefault: string;
  reducedMotion: boolean;
  timezone: string;
  locale: string;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: string;
  defaultBrandId: string;
  defaultApprovalMode: string;
  defaultCalendarView: string;
  defaultLanguage: string;
  defaultReportingPeriod: string;
  allowedAiProvider: string;
  allowedDefaultTextModel: string;
  allowedImageModel: string;
  executionMode: string;
  fallbackBehavior: string;
  costWarningThresholdUsd: number;
  notifyApprovals: boolean;
  notifyFailures: boolean;
  notifyCredentialWarnings: boolean;
  notifyCampaignCompletion: boolean;
  notifyCostThreshold: boolean;
  notifyRiskEscalation: boolean;
}

const defaultPreferences: UserPreferencesData = {
  theme: 'system',
  density: 'comfortable',
  sidebarDefault: 'expanded',
  reducedMotion: false,
  timezone: 'UTC',
  locale: 'en-US',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  firstDayOfWeek: 'monday',
  defaultBrandId: '',
  defaultApprovalMode: 'APPROVAL_REQUIRED',
  defaultCalendarView: 'month',
  defaultLanguage: 'en-US',
  defaultReportingPeriod: '30d',
  allowedAiProvider: 'gemini',
  allowedDefaultTextModel: 'gemini-2.5-flash',
  allowedImageModel: 'imagen-3',
  executionMode: 'mock',
  fallbackBehavior: 'mock_fallback',
  costWarningThresholdUsd: 250,
  notifyApprovals: true,
  notifyFailures: true,
  notifyCredentialWarnings: true,
  notifyCampaignCompletion: true,
  notifyCostThreshold: true,
  notifyRiskEscalation: true,
};

interface PreferencesContextType {
  preferences: UserPreferencesData;
  updatePreferences: (newPrefs: Partial<UserPreferencesData>) => Promise<void>;
  loading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferencesData>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  const applyDomSettings = (prefs: UserPreferencesData) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Apply Theme
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (prefs.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }

    // Apply Density
    root.setAttribute('data-density', prefs.density || 'comfortable');

    // Apply Reduced Motion
    if (prefs.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  const fetchServerPreferences = async () => {
    try {
      const res = await fetch('/api/settings/preferences');
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) {
          const merged: UserPreferencesData = {
            ...defaultPreferences,
            ...data,
          };
          setPreferences(merged);
          applyDomSettings(merged);
        }
      }
    } catch (err) {
      console.warn('Failed to load server preferences, using defaults:', err);
      applyDomSettings(defaultPreferences);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerPreferences();
  }, []);

  const updatePreferences = async (newPrefs: Partial<UserPreferencesData>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    applyDomSettings(updated);

    try {
      await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
    } catch (err) {
      console.error('Failed to sync updated preferences to server:', err);
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, loading }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
