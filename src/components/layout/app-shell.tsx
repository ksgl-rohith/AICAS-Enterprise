'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShowcase = pathname === '/';

  if (isShowcase) {
    return <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white font-sans">{children}</div>;
  }

  return (
    <div className="flex flex-1 relative min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
