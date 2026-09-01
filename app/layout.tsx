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
        
        {/* Tombol Burger Khusus Mobile (Disembunyikan di Halaman Login) */}
        {!isLoginPage && (
          <div className="md:hidden fixed top-3 left-3 z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-blue-900 text-white rounded-lg shadow-md focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        )}

        {/* Sidebar Utama (Responsif: Slide-over di HP, Permanen di Desktop) */}
        {!isLoginPage && (
          <>
            <div
              className={`
                fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Sidebar />
            </div>

            {/* Overlay Gelap Transparan Saat Menu Mobile Terbuka */}
            {isMobileMenuOpen && (
              <div
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
              />
            )}
          </>
        )}

        {/* Area Konten Utama */}
        <main className="flex-1 overflow-y-auto mt-14 md:mt-0 p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}