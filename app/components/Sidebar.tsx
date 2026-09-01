'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('Admin');

  useEffect(() => {
    const fetchSettings = () => {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success) setSettings(data.data);
        })
        .catch(err => console.error("Gagal memuat setting sidebar", err));
    };

    fetchSettings();
    window.addEventListener('settingsUpdated', fetchSettings);

    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        if (parsedUser?.role) {
          setUserRole(parsedUser.role);
        }
      } catch (e) {
        console.error("Gagal membaca sesi user", e);
      }
    }

    return () => {
      window.removeEventListener('settingsUpdated', fetchSettings);
    };
  }, []);

  const [openMaster, setOpenMaster] = useState(
    pathname.startsWith('/santri') || 
    pathname.startsWith('/guru') || 
    pathname.startsWith('/musyrif') || 
    pathname.startsWith('/kelas') || 
    pathname.startsWith('/kamar') ||
    pathname.startsWith('/alquran')
  );
  const [openPelanggaran, setOpenPelanggaran] = useState(pathname.startsWith('/pelanggaran'));
  const [openPenilaian, setOpenPenilaian] = useState(pathname.startsWith('/penilaian-asrama'));
  const [openRapor, setOpenRapor] = useState(pathname.startsWith('/rapor'));

  const isAdmin = userRole === 'Admin';
  const isWakaOrAdmin = userRole === 'Admin' || userRole === 'Waka';
  const isMusyrifOrAbove = userRole === 'Admin' || userRole === 'Waka' || userRole === 'Musyrif';

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      localStorage.removeItem('user_session');
      router.push('/login');
    }
  };

  const handleLinkClick = () => {
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <aside className={`
      w-64 bg-[#0c2a57] text-slate-200 min-h-screen p-4 flex flex-col justify-between shadow-lg 
      fixed md:sticky top-0 h-screen shrink-0 overflow-y-auto z-40 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3.5 py-4 mb-4 border-b border-slate-700/50 mt-10 md:mt-0">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="w-9 h-9 object-contain bg-white rounded-xl p-1 shadow-md" />
          ) : (
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
              EP
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="font-bold text-white text-xs tracking-wide truncate">{settings?.nama_instansi || "E-PENGASUHAN"}</h1>
            <p className="text-[10px] text-slate-400 truncate">Role: <span className="text-blue-300 font-semibold">{userRole}</span></p>
          </div>
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="flex flex-col gap-1 text-xs font-semibold">
          <Link
            href="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
              pathname === '/' ? 'bg-[#2c6ddf] text-white font-bold shadow-md' : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <span className="text-base">📊</span>
            <span>Dashboard</span>
          </Link>

          {isAdmin && (
            <div>
              <button
                onClick={() => setOpenMaster(!openMaster)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition hover:bg-slate-800/60 text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">📁</span>
                  <span>Master Data</span>
                </div>
                <span className={`text-[10px] transition-transform duration-200 ${openMaster ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openMaster && (
                <div className="ml-4 pl-3 my-1 border-l border-slate-700/60 flex flex-col gap-1 py-1">
                  <Link href="/santri" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/santri' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Data Santri</Link>
                  <Link href="/guru" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/guru' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Data Guru</Link>
                  <Link href="/musyrif" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/musyrif' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Data Musyrif</Link>
                  <Link href="/kelas" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/kelas' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Data Kelas</Link>
                  <Link href="/kamar" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/kamar' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Data Kamar / Asrama</Link>
                  <Link href="/alquran" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/alquran' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Data Al-Qur'an (Halaqoh)</Link>
                </div>
              )}
            </div>
          )}

          {isMusyrifOrAbove && (
            <div>
              <button
                onClick={() => setOpenPelanggaran(!openPelanggaran)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition hover:bg-slate-800/60 text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">⚠️</span>
                  <span>Pelanggaran Santri</span>
                </div>
                <span className={`text-[10px] transition-transform duration-200 ${openPelanggaran ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openPelanggaran && (
                <div className="ml-4 pl-3 my-1 border-l border-slate-700/60 flex flex-col gap-1 py-1">
                  <Link href="/pelanggaran?ranah=sekolah" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname.includes('ranah=sekolah') ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>  Sekolah</Link>
                  <Link href="/pelanggaran?ranah=asrama" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname.includes('ranah=asrama') ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>  Asrama</Link>
                  <Link href="/pelanggaran?ranah=quran" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname.includes('ranah=quran') ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>  Al-Qur'an</Link>
                </div>
              )}
            </div>
          )}

          {isMusyrifOrAbove && (
            <div>
              <button
                onClick={() => setOpenPenilaian(!openPenilaian)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition hover:bg-slate-800/60 text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🏠</span>
                  <span>Penilaian Asrama</span>
                </div>
                <span className={`text-[10px] transition-transform duration-200 ${openPenilaian ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openPenilaian && (
                <div className="ml-4 pl-3 my-1 border-l border-slate-700/60 flex flex-col gap-1 py-1">
                  <Link href="/penilaian-asrama/kamar" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/penilaian-asrama/kamar' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Kedisiplinan Kamar</Link>
                  <Link href="/penilaian-asrama/santri" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/penilaian-asrama/santri' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Kedisiplinan Santri</Link>
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <Link
              href="/deep-talk"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                pathname === '/deep-talk' ? 'bg-[#2c6ddf] text-white font-bold shadow-md' : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <span className="text-base">🗣️</span>
              <span>Deep Talk</span>
            </Link>
          )}

          {isWakaOrAdmin && (
            <div>
              <button
                onClick={() => setOpenRapor(!openRapor)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition hover:bg-slate-800/60 text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">📜</span>
                  <span>Rapor Pengasuhan</span>
                </div>
                <span className={`text-[10px] transition-transform duration-200 ${openRapor ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openRapor && (
                <div className="ml-4 pl-3 my-1 border-l border-slate-700/60 flex flex-col gap-1 py-1">
                  <Link href="/rapor-pengasuhan/kelas-10" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/rapor-pengasuhan/kelas-10' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Rapor Kelas 10</Link>
                  <Link href="/rapor-pengasuhan/kelas-11" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/rapor-pengasuhan/kelas-11' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Rapor Kelas 11</Link>
                  <Link href="/rapor-pengasuhan/kelas-12" onClick={handleLinkClick} className={`px-3 py-2 rounded-lg text-[11px] transition ${pathname === '/rapor-pengasuhan/kelas-12' ? 'bg-[#2c6ddf] text-white font-bold' : 'text-slate-400 hover:text-white'}`}> Rapor Kelas 12</Link>
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                pathname === '/settings' ? 'bg-[#2c6ddf] text-white font-bold shadow-md' : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <span className="text-base">⚙️</span>
              <span>Pengaturan Sistem</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bagian Bawah: Tombol Logout & Info Instansi Aktif */}
      <div className="pt-4 mt-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 mb-3 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition border border-red-500/20"
        >
          <img src="/assets/logout.png" alt="Logout" className="w-4 h-4 object-contain" />
          <span>Keluar (Logout)</span>
        </button>

        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 text-[11px]">
          <p className="text-slate-400">Instansi Active:</p>
          <p className="font-bold text-white truncate">{settings?.nama_instansi || "SMA IT Darul Qur'an Mulia"}</p>
        </div>
      </div>
    </aside>
  );
}