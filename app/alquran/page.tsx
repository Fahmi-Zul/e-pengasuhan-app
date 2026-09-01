'use client';

import React, { useState, useEffect } from 'react';

interface Musyrif {
  id: number;
  nama_musyrif: string;
}

interface Santri {
  id: number;
  nama_santri: string;
  nama_kelas: string;
}

interface Anggota {
  santri_id: number;
  nama_santri: string;
  nama_kelas: string;
}

interface Halaqah {
  id: number;
  nama_halaqah: string;
  musyrif_id: number;
  nama_musyrif: string;
  anggota: Anggota[];
}

export default function KelompokAlquranPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [musyrifList, setMusyrifList] = useState<Musyrif[]>([]);
  const [allSantri, setAllSantri] = useState<Santri[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [namaHalaqah, setNamaHalaqah] = useState('');
  const [selectedMusyrif, setSelectedMusyrif] = useState('');
  const [searchSantri, setSearchSantri] = useState('');
  const [selectedSantriList, setSelectedSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetch('/api/halaqoh')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setHalaqahList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/musyrif')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMusyrifList(data.data);
      });

    fetch('/api/santri')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAllSantri(data.data);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSantri = (santri: Santri) => {
    if (!selectedSantriList.some((s) => s.id === santri.id)) {
      setSelectedSantriList([...selectedSantriList, santri]);
    }
    setSearchSantri('');
  };

  const handleRemoveSantri = (id: number) => {
    setSelectedSantriList(selectedSantriList.filter((s) => s.id !== id));
  };

  const handleEditClick = (h: Halaqah) => {
    setEditingId(h.id);
    setNamaHalaqah(h.nama_halaqah);
    setSelectedMusyrif(String(h.musyrif_id || ''));

    // Peta anggota ke format objek Santri
    const convertedAnggota: Santri[] = (h.anggota || []).map((m) => ({
      id: m.santri_id,
      nama_santri: m.nama_santri,
      nama_kelas: m.nama_kelas,
    }));
    setSelectedSantriList(convertedAnggota);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNamaHalaqah('');
    setSelectedMusyrif('');
    setSelectedSantriList([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMusyrif) {
      alert("Silakan pilih Musyrif Pembina Al-Qur'an");
      return;
    }

    setSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const bodyData = editingId
      ? {
          id: editingId,
          nama_halaqah: namaHalaqah,
          musyrif_id: parseInt(selectedMusyrif, 10),
          santri_ids: selectedSantriList.map((s) => s.id),
        }
      : {
          nama_halaqah: namaHalaqah,
          musyrif_id: parseInt(selectedMusyrif, 10),
          santri_ids: selectedSantriList.map((s) => s.id),
        };

    try {
      const res = await fetch('/api/halaqoh', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();
      setSubmitting(false);

      if (result.success) {
        alert(editingId ? "Kelompok Al-Qur'an Berhasil Diperbarui!" : "Kelompok Al-Qur'an Berhasil Disimpan!");
        handleCancelEdit();
        loadData();
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch (err: any) {
      setSubmitting(false);
      alert('Terjadi kesalahan jaringan: ' + err.message);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus kelompok Al-Qur'an "${nama}"?`)) return;
    const res = await fetch('/api/halaqoh', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.success) loadData();
  };

  const filteredSantriOpsi = searchSantri.trim() === ''
    ? []
    : allSantri
        .filter((s) => s.nama_santri.toLowerCase().includes(searchSantri.toLowerCase()))
        .slice(0, 6);

  return (
    <main className="p-6 bg-[#f4f7fb] min-h-screen text-slate-800">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-[#0c2a57]">Kelompok Al-Qur'an </h1>
        <p className="text-xs text-slate-500">Kelola kelompok halaqoh, pembimbing Musyrif, dan pemetaan santri gabungan kelas 10, 11, & 12</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Input / Edit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#0c2a57] mb-4">
            {editingId ? '✏️ Edit Kelompok Al-Qur\'an' : '+ Buat Kelompok Al-Qur\'an Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelompok / Halaqoh</label>
              <input
                type="text"
                required
                value={namaHalaqah}
                onChange={(e) => setNamaHalaqah(e.target.value)}
                placeholder="Contoh: Kelompok 1 / Halaqoh Abu Bakar"
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Musyrif Pembina (Dari Master Data)</label>
              <select
                required
                value={selectedMusyrif}
                onChange={(e) => setSelectedMusyrif(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-medium text-slate-700"
              >
                <option value="">-- Pilih Musyrif Al-Qur'an --</option>
                {musyrifList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama_musyrif}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-complete Cari Santri */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tambah Anggota Santri (Ketik Nama)</label>
              <input
                type="text"
                value={searchSantri}
                onChange={(e) => setSearchSantri(e.target.value)}
                placeholder="Ketik nama santri kelas 10, 11, atau 12..."
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />

              {filteredSantriOpsi.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {filteredSantriOpsi.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => handleAddSantri(s)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex justify-between items-center border-b border-slate-50"
                    >
                      <span className="font-bold text-[#0c2a57]">{s.nama_santri}</span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-semibold text-[10px]">{s.nama_kelas}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Daftar Chips Santri Terpilih */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Anggota Terpilih ({selectedSantriList.length}):</label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {selectedSantriList.length === 0 ? (
                  <span className="text-slate-400 text-[11px]">Belum ada santri dipilih</span>
                ) : (
                  selectedSantriList.map((s) => (
                    <span key={s.id} className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                      {s.nama_santri} ({s.nama_kelas})
                      <button type="button" onClick={() => handleRemoveSantri(s.id)} className="text-emerald-900 font-bold hover:text-red-600">×</button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/2 bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl font-semibold hover:bg-slate-300"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`${editingId ? 'w-1/2 bg-amber-600 hover:bg-amber-700' : 'w-full bg-[#2c6ddf] hover:bg-[#1a55be]'} text-white text-xs py-2.5 rounded-xl font-semibold disabled:opacity-50 transition`}
              >
                {submitting ? 'Menyimpan...' : editingId ? 'Simpan' : 'Simpan Kelompok Al-Qur\'an'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Data Kelompok */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-600 uppercase border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-10">NO</th>
                <th className="px-6 py-3">KELOMPOK / HALAQOH</th>
                <th className="px-6 py-3">MUSYRIF PEMBINA</th>
                <th className="px-6 py-3">ANGGOTA SANTRI (CAMPUR KELAS)</th>
                <th className="px-6 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6 text-slate-400">Memuat...</td></tr>
              ) : halaqahList.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-slate-400">Belum ada kelompok Al-Qur'an.</td></tr>
              ) : (
                halaqahList.map((h, idx) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-center font-bold text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-3 font-bold text-[#0c2a57]">{h.nama_halaqah}</td>
                    <td className="px-6 py-3 text-xs font-semibold text-emerald-700">{h.nama_musyrif}</td>
                    <td className="px-6 py-3 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {h.anggota && h.anggota.length > 0 ? (
                          h.anggota.map((m) => (
                            <span key={m.santri_id} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                              {m.nama_santri} ({m.nama_kelas})
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Belum ada anggota</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(h)}
                          className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(h.id, h.nama_halaqah)}
                          className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100"
                        >
                          Hapus
                        </button>
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