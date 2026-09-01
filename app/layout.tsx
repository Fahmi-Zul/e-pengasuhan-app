"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import "./globals.css"; // Sesuaikan dengan path file CSS global Anda jika berbeda

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          
          {/* Tombol Burger Khusus Mobile */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-blue-900 text-white rounded-md shadow-md focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Sidebar Navigasi (Responsif: Slide-over di HP, Permanen di Desktop) */}
          <aside
            className={`
              fixed md:static inset-y-0 left-0 z-40 w-64 bg-blue-950 text-white p-4 flex flex-col justify-between
              transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
          >
            <div>
              {/* Header Sidebar / Logo */}
              <div className="flex items-center justify-between mb-8 mt-12 md:mt-0">
                <h1 className="text-xl font-bold tracking-wide">E-Pengasuhan</h1>
              </div>

              {/* Menu Navigasi */}
              <nav className="space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/master-data"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Master Data
                </Link>
                <Link
                  href="/pelanggaran"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Pelanggaran Santri
                </Link>
                <Link
                  href="/penilaian"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Penilaian Asrama
                </Link>
                <Link
                  href="/deep-talk"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Deep Talk
                </Link>
                <Link
                  href="/rapor"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Rapor Pengasuhan
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Pengaturan Sistem
                </Link>
              </nav>
            </div>

            {/* Tombol Keluar di Bawah Sidebar */}
            <div className="pt-4 border-t border-blue-900">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // Tambahkan logika logout Anda di sini
                }}
                className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-600/20 text-red-300 hover:text-red-200 transition-colors"
              >
                Keluar (Logout)
              </button>
            </div>
          </aside>

          {/* Overlay Gelap Transparan saat Menu Mobile Terbuka */}
          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
            />
          )}

          {/* Area Konten Utama */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 md:mt-0 bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}