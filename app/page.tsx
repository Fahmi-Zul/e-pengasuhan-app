'use client';

import React, { useState, useEffect } from 'react';

interface SummaryData {
  total_santri: number;
  total_guru: number;
  total_musyrif: number;
  curr_kasus: number;
  prev_kasus: number;
  diff_kasus: number;
  percent_change: number;
  is_increase: boolean;
  label_periode: string;
}

interface BreakdownItem {
  label: string;
  total_poin: number;
}

interface TrendPoint {
  label: string;
  sekolah: number;
  asrama: number;
  quran: number;
}

interface SantriItem {
  id: number;
  nama_santri: string;
  nama_kelas: string;
  total_poin: number;
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<'harian' | 'mingguan' | 'bulanan' | 'persemester' | 'tahunan'>('bulanan');
  const [summary, setSummary] = useState<SummaryData>({
    total_santri: 0, total_guru: 0, total_musyrif: 0, curr_kasus: 0, prev_kasus: 0, diff_kasus: 0, percent_change: 0, is_increase: false, label_periode: '',
  });
  const [breakdown, setBreakdown] = useState<{ sekolah: BreakdownItem[]; asrama: BreakdownItem[]; quran: BreakdownItem[] }>({
    sekolah: [], asrama: [], quran: [],
  });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [topIndisipliner, setTopIndisipliner] = useState<SantriItem[]>([]);
  const [topTerbaik, setTopTerbaik] = useState<SantriItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSummary(data.summary);
          setBreakdown(data.breakdown || { sekolah: [], asrama: [], quran: [] });
          setTrend(data.trend || []);
          setTopIndisipliner(data.top_indisipliner || []);
          setTopTerbaik(data.top_terbaik || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  // Kalkulasi Titik Kurva Real SVG
  const maxVal = Math.max(...trend.map((d) => Math.max(d.sekolah || 0, d.asrama || 0, d.quran || 0)), 10) * 1.25;
  const width = 600;
  const height = 180;
  const padX = 35;
  const padY = 25;

  const getPoints = (key: 'sekolah' | 'asrama' | 'quran') =>
    trend.map((d, i) => ({
      x: padX + (i * (width - padX * 2)) / Math.max(trend.length - 1, 1),
      y: height - padY - ((d[key] || 0) * (height - padY * 2)) / maxVal,
    }));

  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (!pts || pts.length === 0) return '';
    return pts.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = a[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    }, '');
  };

  const createAreaPath = (pts: { x: number; y: number }[]) => {
    const linePath = createSmoothPath(pts);
    if (!linePath) return '';
    return `${linePath} L ${pts[pts.length - 1].x} ${height - padY} L ${pts[0].x} ${height - padY} Z`;
  };

  return (
    <main className="p-6 bg-[#f4f7fc] min-h-screen text-slate-700">
      
      {/* 1. Header & Filter Evaluasi Rapat */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">Dashboard Evaluasi Pengasuhan</h1>
          <p className="text-xs text-slate-400">Analisis tren peningkatan & penurunan kasus kedisiplinan santri</p>
        </div>
        
        {/* Tombol Filter Rentang Waktu Terintegrasi */}
        <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-slate-200/80">
          {(['harian', 'mingguan', 'bulanan', 'persemester', 'tahunan'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                filter === f ? 'bg-[#4f46e5] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === 'persemester' ? 'Persemester' : f}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Kartu Informasi Evaluasi & Entitas Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Santri Aktif</span>
            <div className="text-2xl font-black text-[#1e293b] mt-0.5">{loading ? '...' : summary.total_santri}</div>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">🎓</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Guru</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{loading ? '...' : summary.total_guru}</div>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">👨‍🏫</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Musyrif</span>
            <div className="text-2xl font-black text-blue-600 mt-0.5">{loading ? '...' : summary.total_musyrif}</div>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">🕌</div>
        </div>

        {/* KARTU EVALUASI TREN NAIK/TURUN INTEGRASI */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{summary.label_periode || 'Evaluasi Tren'}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#1e293b]">{summary.curr_kasus} <span className="text-xs text-slate-400 font-normal">Kasus</span></span>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 ${summary.is_increase ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {summary.is_increase ? `↑ +${summary.percent_change}%` : `↓ ${summary.percent_change}%`}
              </span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${summary.is_increase ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {summary.is_increase ? '📈' : '📉'}
          </div>
        </div>
      </div>

      {/* 3. Main Kurva Fluktuasi Terintegrasi & Breakdown Ranah */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Main Smooth Line Chart Curve Terintegrasi Filter Waktu */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1e293b]">🌊 Grafik Fluktuasi Kasus 3 Ranah ({filter.toUpperCase()})</h2>
              <p className="text-xs text-slate-400">Dinamika tren poin ranah Sekolah, Asrama, dan Al-Qur'an</p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-600"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Sekolah</span>
              <span className="flex items-center gap-1.5 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Asrama</span>
              <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Al-Qur'an</span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden my-auto">
            {loading ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 italic">Memuat grafik...</div>
            ) : trend.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 italic">Belum ada data poin pelanggaran.</div>
            ) : (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="gradSekolah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                  const yPos = padY + ratio * (height - padY * 2);
                  return <line key={idx} x1={padX} y1={yPos} x2={width - padX} y2={yPos} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.5" />;
                })}

                {/* Kurva Dynamic per Filter */}
                <path d={createAreaPath(getPoints('sekolah'))} fill="url(#gradSekolah)" />
                <path d={createSmoothPath(getPoints('sekolah'))} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                <path d={createSmoothPath(getPoints('asrama'))} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                <path d={createSmoothPath(getPoints('quran'))} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

                {/* Labels Dynamic */}
                {trend.map((d, i) => {
                  const x = padX + (i * (width - padX * 2)) / Math.max(trend.length - 1, 1);
                  return (
                    <text key={i} x={x} y={height - 2} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">
                      {d.label}
                    </text>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Breakdown Top Ranah Spesifik */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between gap-4">
          <h2 className="text-sm font-bold text-[#1e293b]">📊 Pelanggaran Tertinggi Per Ranah</h2>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Ranah Sekolah</span>
              <span className="text-indigo-600">{breakdown.sekolah[0]?.label || 'Bersih'} ({breakdown.sekolah[0]?.total_poin || 0} Poin)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min((breakdown.sekolah[0]?.total_poin || 0) * 10, 100)}%` }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Ranah Asrama</span>
              <span className="text-amber-600">{breakdown.asrama[0]?.label || 'Bersih'} ({breakdown.asrama[0]?.total_poin || 0} Poin)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min((breakdown.asrama[0]?.total_poin || 0) * 10, 100)}%` }}></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ranah Al-Qur'an</span>
              <span className="text-emerald-600">{breakdown.quran[0]?.label || 'Bersih'} ({breakdown.quran[0]?.total_poin || 0} Poin)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((breakdown.quran[0]?.total_poin || 0) * 10, 100)}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Top 10 Indisipliner vs Teladan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-red-50/60 flex justify-between items-center">
            <h2 className="text-xs font-bold text-red-700">🚨 Top 10 Santri Indisipliner</h2>
            <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-lg">Poin Akumulasi</span>
          </div>
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-3 py-2.5 text-center w-8">NO</th>
                <th className="px-4 py-2.5">NAMA SANTRI</th>
                <th className="px-4 py-2.5 text-center">KELAS</th>
                <th className="px-4 py-2.5 text-center">POIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {topIndisipliner.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-bold text-[#1e293b]">{s.nama_santri}</td>
                  <td className="px-4 py-2.5 text-center text-slate-500 font-semibold">{s.nama_kelas}</td>
                  <td className="px-4 py-2.5 text-center font-black text-red-600">+{s.total_poin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-emerald-50/60 flex justify-between items-center">
            <h2 className="text-xs font-bold text-emerald-700">⭐ Top 10 Santri Teladan / Terbaik</h2>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg">Bersih 0 Poin</span>
          </div>
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-3 py-2.5 text-center w-8">NO</th>
                <th className="px-4 py-2.5">NAMA SANTRI</th>
                <th className="px-4 py-2.5 text-center">KELAS</th>
                <th className="px-4 py-2.5 text-center">SKOR RATA-RATA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {topTerbaik.map((santri: any, idx: number) => (
                <tr key={santri.id || idx} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-bold text-[#1e293b]">{santri.nama_santri}</td>
                  <td className="px-4 py-2.5 text-center text-slate-500 font-semibold">{santri.nama_kelas || santri.kelas}</td>
                  <td className="px-4 py-2.5 text-center font-bold text-emerald-600">
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                      {santri.skor_rata_rata > 0 ? `Skor: ${Number(santri.skor_rata_rata).toFixed(2)}` : 'Bersih (0 Poin)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}