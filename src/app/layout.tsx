import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-context';
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
    <html lang="en" suppressHydrationWarning className="light">
      <body className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white transition-colors duration-200 antialiased">
        <AuthProvider>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
