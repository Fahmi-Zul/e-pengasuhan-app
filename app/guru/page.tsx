'use client';

import React, { useState, useEffect } from 'react';

interface Guru {
  id: number;
  nama_guru: string;
  no_hp: string;
  jabatan_struktural: string;
  is_wali_kelas: boolean;
  kelas_wali: string;
}

interface Kelas {
  id: number;
  nama_kelas: string;
}

const OPSI_JABATAN = [
  'Guru Pengajar / KBM',
  'Pembina OSDQM',
  'Staf Bahasa',
  'Staf INPEDI',
  'Staf Kedinasan',
  'Staf Kesantrian Kelas 10',
  'Staf Kesantrian Kelas 11',
  'Staf Kesantrian Kelas 12',
  'Staf Kesiswaan',
  'Staf Penilaian',
  'Staf Ulum Syar\'i',
  'Waka kedisiplinan',
  'Waka Kesiswaan',
  'Waka Kurikulum',
  'WAKA Ulum Syar\'i',

];

export default function DataGuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama_guru: '',
    no_hp: '',
    jabatan_struktural: 'Guru Pengajar / KBM',
    is_wali_kelas: false,
    kelas_wali: '',
  });

  const loadData = () => {
    setLoading(true);
    fetch('/api/guru')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGuruList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/kelas')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setKelasList(data.data);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (g: Guru) => {
    setEditingId(g.id);
    setFormData({
      nama_guru: g.nama_guru,
      no_hp: g.no_hp || '',
      jabatan_struktural: g.jabatan_struktural || 'Guru Pengajar / KBM',
      is_wali_kelas: g.is_wali_kelas || false,
      kelas_wali: g.kelas_wali || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      nama_guru: '',
      no_hp: '',
      jabatan_struktural: 'Guru Pengajar / KBM',
      is_wali_kelas: false,
      kelas_wali: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const bodyData = editingId ? { id: editingId, ...formData } : formData;

    const res = await fetch('/api/guru', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    const result = await res.json();
    if (result.success) {
      alert(editingId ? 'Data Guru diperbarui!' : 'Guru berhasil ditambahkan!');
      handleCancelEdit();
      loadData();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus data guru "${nama}"?`)) return;
    const res = await fetch('/api/guru', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.success) loadData();
  };

  return (
    <main className="p-6 bg-[#f4f7fb] min-h-screen text-slate-800">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-[#0c2a57]">Data Guru</h1>
        <p className="text-xs text-slate-500">Kelola daftar guru pengajar, jabatan struktural, dan penugasan wali kelas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tambah/Edit Guru */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#0c2a57] mb-4">
            {editingId ? '✏️ Edit Data Guru' : '+ Tambah Guru Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Guru</label>
              <input
                type="text"
                required
                value={formData.nama_guru}
                onChange={(e) => setFormData({ ...formData, nama_guru: e.target.value })}
                placeholder="Ust. Abdullah, M.Pd."
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan Struktural</label>
              <select
                value={formData.jabatan_struktural}
                onChange={(e) => setFormData({ ...formData, jabatan_struktural: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white text-slate-700 font-medium"
              >
                {OPSI_JABATAN.map((j, idx) => (
                  <option key={idx} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
              <input
                type="text"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                placeholder="081234567890"
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_wali_kelas}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_wali_kelas: e.target.checked,
                      kelas_wali: e.target.checked ? formData.kelas_wali : '',
                    })
                  }
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
                Tugaskan sebagai Wali Kelas
              </label>

              {formData.is_wali_kelas && (
                <div className="mt-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pilih Kelas Ampuan</label>
                  <select
                    required={formData.is_wali_kelas}
                    value={formData.kelas_wali}
                    onChange={(e) => setFormData({ ...formData, kelas_wali: e.target.value })}
                    className="w-full border border-slate-300 p-2 rounded-lg text-xs outline-none bg-white font-bold text-[#0c2a57]"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.nama_kelas}>
                        Kelas {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                className={`${editingId ? 'w-1/2 bg-amber-600 hover:bg-amber-700' : 'w-full bg-[#2c6ddf] hover:bg-[#1a55be]'} text-white text-xs py-2.5 rounded-xl font-semibold transition`}
              >
                {editingId ? 'Simpan' : 'Simpan Data Guru'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Data Guru */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-600 uppercase border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-10">NO</th>
                <th className="px-5 py-3">NAMA GURU</th>
                <th className="px-4 py-3">JABATAN STRUKTURAL</th>
                <th className="px-4 py-3 text-center">WALI KELAS</th>
                <th className="px-4 py-3 text-center">NO. HP</th>
                <th className="px-4 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6 text-slate-400">Memuat...</td></tr>
              ) : guruList.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-slate-400">Belum ada data guru.</td></tr>
              ) : (
                guruList.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-center font-bold text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 font-bold text-[#0c2a57]">{g.nama_guru}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-600">
                      {g.jabatan_struktural || '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {g.is_wali_kelas ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                          {g.kelas_wali && g.kelas_wali !== '-' ? `Wali Kelas ${g.kelas_wali}` : 'Ya'}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-mono">{g.no_hp || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(g)}
                          className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(g.id, g.nama_guru)}
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