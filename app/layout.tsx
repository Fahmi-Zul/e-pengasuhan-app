'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import '@/app/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="id">
      <body className="bg-slate-50 flex min-h-screen">
        {!isLoginPage && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}