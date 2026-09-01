'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { Menu, X } from 'lucide-react';
import '@/app/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <html lang="id">
      <body className="bg-slate-50 flex min-h-screen overflow-x-hidden">
        
        {/* Tombol Burger Khusus Mobile */}
        {!isLoginPage && (
          <div className="md:hidden fixed top-3 left-3 z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-[#0c2a57] text-white rounded-xl shadow-md focus:outline-none border border-slate-700"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

        {/* Sidebar dengan pengontrol props mobile */}
        {!isLoginPage && (
          <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
        )}

        {/* Overlay Gelap Transparan Saat Menu Mobile Terbuka */}
        {isMobileMenuOpen && !isLoginPage && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          />
        )}

        {/* Area Konten Utama */}
        <main className="flex-1 overflow-y-auto mt-14 md:mt-0 p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}