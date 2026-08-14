import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { PreferencesProvider } from '@/components/preferences-provider';
import { AuthProvider } from '@/components/auth-context';
import { WorkspaceProvider } from '@/components/workspace-context';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'AICAS Enterprise - Autonomous Multi-Agent Content Intelligence & Publishing Platform',
  description:
    'Enterprise multi-agent social media content intelligence, generation, deterministic review council, visual studio, automated scheduling, social API connectors, and normalized analytics platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200 antialiased">
        <AuthProvider>
          <WorkspaceProvider>
            <PreferencesProvider>
              <ThemeProvider>
                <AppShell>{children}</AppShell>
              </ThemeProvider>
            </PreferencesProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
