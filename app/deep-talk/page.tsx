'use client';

import React, { useState, useEffect } from 'react';

interface KelasItem {
  id: number;
  nama_kelas: string;
}

interface Santri {
  id: number;
  nama_santri: string;
  kelas?: string;
}

interface DeepTalkData {
  id: number;
  tanggal: string;
  jam: string;
  santri_id: number;
  nama_santri: string;
  kelas: string;
  kategori_topik: string;
  catatan_deeptalk: string;
  tindak_lanjut: string;
}

const LIST_KATEGORI = [
  'Motivasi Belajar / Akademik',
  'Kedisiplinan & Ketertiban',
  'Keluarga / Pribadi',
  'Sosial / Interaksi dengan Teman',
  'Ibadah & Spiritual',
  'Kesehatan / Fisik',
  'Lainnya'
];

export default function DeepTalkPage() {
  const [dataList, setDataList] = useState<DeepTalkData[]>([]);
  const [allSantri, setAllSantri] = useState<Santri[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [selectedSantriNama, setSelectedSantriNama] = useState<string>('');
  const [searchSantriText, setSearchSantriText] = useState('');

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jam: new Date().toTimeString().slice(0, 5),
    kategori_topik: '',
    catatan_deeptalk: '',
    tindak_lanjut: '',
  });

  const loadData = () => {
    setLoading(true);
    fetch('/api/deeptalk')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDataList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/santri')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAllSantri(data.data);
      });

    fetch('/api/kelas')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setKelasList(data.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const daftarKelasUnik = kelasList.length > 0 
    ? kelasList.map((k) => k.nama_kelas) 
    : Array.from(new Set(allSantri.map((s) => s.kelas).filter(Boolean))) as string[];

  const filteredSantriResult = allSantri.filter((s) => {
    if (searchSantriText.trim() === '') return false;
    return s.nama_santri.toLowerCase().includes(searchSantriText.toLowerCase());
  });

  const handleSelectSantri = (s: Santri) => {
    setSelectedSantriId(String(s.id));
    setSelectedSantriNama(s.nama_santri);
    if (s.kelas && s.kelas !== '-') {
      setSelectedKelas(s.kelas);
    }
    setSearchSantriText('');
  };

  const handleEdit = (item: DeepTalkData) => {
    setEditingId(item.id);
    setSelectedKelas(item.kelas || '');
    setSelectedSantriId(String(item.santri_id));
    setSelectedSantriNama(item.nama_santri);
    setFormData({
      tanggal: item.tanggal ? item.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
      jam: item.jam || '08:00',
      kategori_topik: item.kategori_topik,
      catatan_deeptalk: item.catatan_deeptalk,
      tindak_lanjut: item.tindak_lanjut || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setSelectedKelas('');
    setSelectedSantriId('');
    setSelectedSantriNama('');
    setSearchSantriText('');
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      jam: new Date().toTimeString().slice(0, 5),
      kategori_topik: '',
      catatan_deeptalk: '',
      tindak_lanjut: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKelas || !selectedSantriId || !formData.tanggal || !formData.jam || !formData.kategori_topik || !formData.catatan_deeptalk) {
      alert('Mohon lengkapi Kelas, Santri, Tanggal, Jam, Topik, dan Catatan Deep Talk!');
      return;
    }

    const payload = {
      santri_id: selectedSantriId,
      kelas: selectedKelas,
      ...formData,
    };

    const method = editingId ? 'PUT' : 'POST';
    const bodyData = editingId ? { id: editingId, ...payload } : payload;

    const res = await fetch('/api/deeptalk', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    const result = await res.json();
    if (result.success) {
      alert(editingId ? 'Data Deep Talk berhasil diperbarui!' : 'Data Deep Talk berhasil disimpan!');
      handleCancel();
      loadData();
    } else {
      alert('Gagal: ' + result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus catatan sesi deep talk ini?')) return;
    const res = await fetch('/api/deeptalk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.success) loadData();
  };

  return (
    <main className="p-6 bg-[#f4f7fc] min-h-screen text-slate-700">
      <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm mb-6">
        <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">Sesi Deep Talk & Konseling Waka</h1>
        <p className="text-xs text-slate-400">Pengelola Utama: Ust. Septra Yodi, M.Pd., Gr.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#1e293b] mb-4">
            {editingId ? '✏️ Edit Sesi Deep Talk' : '📋 Catat Sesi Deep Talk Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">TANGGAL</label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">JAM</label>
                <input
                  type="time"
                  required
                  value={formData.jam}
                  onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none font-medium"
                />
              </div>
            </div>

            {/* 1. Pilih Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">PILIH KELAS</label>
              <select
                required
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-white font-bold text-indigo-700"
              >
                <option value="">-- Pilih Kelas --</option>
                {daftarKelasUnik.map((kelasName) => (
                  <option key={kelasName} value={kelasName}>{kelasName}</option>
                ))}
              </select>
            </div>

            {/* 2. Cari Santri (Tanpa Keterangan Kelas - di Bawahnya) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 relative">
              <span className="text-xs font-bold text-indigo-900">🔍 Cari Nama Santri:</span>
              <input
                type="text"
                value={searchSantriText}
                onChange={(e) => setSearchSantriText(e.target.value)}
                placeholder="Ketik nama santri..."
                className="w-full border border-slate-200 p-2 rounded-lg text-xs outline-none bg-white"
              />

              {selectedSantriNama && (
                <div className="mt-1 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-indigo-950 block">Santri: {selectedSantriNama}</span>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100 px-2 py-0.5 rounded-md inline-block mt-1">
                      Kelas: {selectedKelas || '-'}
                    </span>
                  </div>
                  <button type="button" onClick={() => { setSelectedSantriId(''); setSelectedSantriNama(''); }} className="text-red-600 font-bold text-base px-2">×</button>
                </div>
              )}

              {searchSantriText.trim() !== '' && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto shadow-xl z-30">
                  {filteredSantriResult.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">Santri tidak ditemukan</div>
                  ) : (
                    filteredSantriResult.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleSelectSantri(s)}
                        className="w-full text-left p-2.5 text-xs hover:bg-indigo-50 border-b border-slate-100 flex justify-between items-center font-semibold"
                      >
                        {/* Hanya menampilkan Nama Santri secara bersih */}
                        <span className="block text-[#1e293b]">{s.nama_santri}</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">Pilih</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">PEWAWANCARA (ADMIN)</label>
              <input
                type="text"
                disabled
                value="Ust. Septra Yodi, M.Pd., Gr."
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-slate-100 font-bold text-indigo-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">KATEGORI TOPIK / MASALAH</label>
              <select
                required
                value={formData.kategori_topik}
                onChange={(e) => setFormData({ ...formData, kategori_topik: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-white font-bold text-indigo-700"
              >
                <option value="">-- Pilih Kategori Topik --</option>
                {LIST_KATEGORI.map((kat) => (
                  <option key={kat} value={kat}>{kat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">HASIL / CATATAN DEEP TALK</label>
              <textarea
                required
                value={formData.catatan_deeptalk}
                onChange={(e) => setFormData({ ...formData, catatan_deeptalk: e.target.value })}
                placeholder="Ringkasan hasil obrolan / masalah santri..."
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none h-20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">TINDAK LANJUT</label>
              <textarea
                value={formData.tindak_lanjut}
                onChange={(e) => setFormData({ ...formData, tindak_lanjut: e.target.value })}
                placeholder="Rencana tindak lanjut / penanganan..."
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none h-16"
              />
            </div>

            <div className="flex gap-2 mt-2">
              {editingId && (
                <button type="button" onClick={handleCancel} className="w-1/2 bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl font-bold">Batal</button>
              )}
              <button type="submit" className={`${editingId ? 'w-1/2 bg-amber-600' : 'w-full bg-[#4f46e5]'} text-white text-xs py-2.5 rounded-xl font-bold shadow-md`}>
                {editingId ? 'Simpan Perubahan' : 'Simpan Deep Talk'}
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 text-center w-8">NO</th>
                <th className="px-4 py-3">SANTRI, KELAS & TOPIK</th>
                <th className="px-4 py-3">HASIL DEEP TALK & TINDAK LANJUT</th>
                <th className="px-4 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-6 text-slate-400">Memuat data...</td></tr>
              ) : dataList.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-slate-400">Belum ada riwayat sesi deep talk.</td></tr>
              ) : (
                dataList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 align-top">
                    <td className="px-3 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#1e293b] text-sm mb-0.5">{item.nama_santri}</div>
                      <div className="flex gap-1.5 mb-1">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          Kelas: {item.kelas}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          {item.kategori_topik}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        📅 {item.tanggal ? item.tanggal.split('T')[0] : '-'} • ⏰ {item.jam ? item.jam : '-'} | 👨‍🏫 Ust. Septra Yodi, M.Pd., Gr.
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 mb-1.5">
                        <span className="font-bold text-[10px] text-slate-400 uppercase block mb-0.5">Catatan Deep Talk:</span>
                        {item.catatan_deeptalk}
                      </div>
                      <div className="p-2 bg-amber-50/50 border border-amber-200/60 rounded-lg text-slate-700">
                        <span className="font-bold text-[10px] text-amber-600 uppercase block mb-0.5">Tindak Lanjut:</span>
                        {item.tindak_lanjut ? item.tindak_lanjut : <span className="text-slate-400 italic">- Belum ada tindak lanjut -</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center pt-4">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => handleEdit(item)} className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg font-bold">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}