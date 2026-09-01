'use client';

import React, { useState, useEffect } from 'react';

interface Musyrif {
  id: number;
  nama_musyrif: string;
  no_hp: string;
  unit_tugas: string;
  kategori: string;
}

export default function DataMusyrifPage() {
  const [musyrifList, setMusyrifList] = useState<Musyrif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKategori, setFilterKategori] = useState('all');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama_musyrif: '',
    no_hp: '',
    unit_tugas: 'SMA Putra',
    kategori: 'Asrama',
  });

  const loadMusyrif = () => {
    setLoading(true);
    fetch(`/api/musyrif?kategori=${filterKategori}`)
      .then((res) => {
        if (!res.ok) return { success: false, data: [] };
        return res.json();
      })
      .then((data) => {
        if (data && data.success) setMusyrifList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadMusyrif();
  }, [filterKategori]);

  const handleEditClick = (m: Musyrif) => {
    setEditingId(m.id);
    setFormData({
      nama_musyrif: m.nama_musyrif,
      no_hp: m.no_hp || '',
      unit_tugas: m.unit_tugas || 'SMA Putra',
      kategori: m.kategori || 'Asrama',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ nama_musyrif: '', no_hp: '', unit_tugas: 'SMA Putra', kategori: 'Asrama' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const bodyData = editingId ? { id: editingId, ...formData } : formData;

    const res = await fetch('/api/musyrif', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    const result = await res.json();
    if (result.success) {
      alert(editingId ? 'Data musyrif diperbarui!' : 'Musyrif berhasil ditambahkan!');
      handleCancelEdit();
      loadMusyrif();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus musyrif "${nama}"?`)) return;
    const res = await fetch('/api/musyrif', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.success) {
      loadMusyrif();
    } else {
      alert('Gagal menghapus: ' + result.error);
    }
  };

  return (
    <main className="p-6 bg-[#f4f7fb] min-h-screen text-slate-800">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-[#0c2a57]">Data Musyrif</h1>
        <p className="text-xs text-slate-500">Kelola daftar pembina pengasuhan harian asrama dan Al-Qur'an</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tambah/Edit Musyrif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#0c2a57] mb-4">
            {editingId ? '✏️ Edit Data Musyrif' : '+ Tambah Musyrif Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Pembina / Amanah</label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-bold text-emerald-700"
              >
                <option value="Asrama">Musyrif Asrama</option>
                <option value="Al-Qur'an">Musyrif Al-Qur'an / Halaqoh</option>
                <option value="Keduanya">⭐ Keduanya (Asrama & Al-Qur'an)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Musyrif</label>
              <input
                type="text"
                required
                value={formData.nama_musyrif}
                onChange={(e) => setFormData({ ...formData, nama_musyrif: e.target.value })}
                placeholder="Ust. Ahmad Zaki"
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                placeholder="081299887766"
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Tugas</label>
              <input
                type="text"
                value={formData.unit_tugas}
                onChange={(e) => setFormData({ ...formData, unit_tugas: e.target.value })}
                placeholder="SMA Putra"
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
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
                className={`${editingId ? 'w-1/2 bg-amber-600 hover:bg-amber-700' : 'w-full bg-[#2c6ddf] hover:bg-[#1a55be]'} text-white text-xs py-2.5 rounded-xl font-semibold`}
              >
                {editingId ? 'Simpan' : 'Simpan Data Musyrif'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Musyrif */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">🔍 Filter Kategori:</span>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="border border-slate-300 p-2 rounded-xl text-xs font-bold text-[#0c2a57] bg-slate-50 outline-none"
            >
              <option value="all">Semua Kategori Musyrif</option>
              <option value="Asrama">Khusus Musyrif Asrama</option>
              <option value="Al-Qur'an">Khusus Musyrif Al-Qur'an / Halaqoh</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-xs text-slate-600 uppercase border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3 text-center w-10">NO</th>
                  <th className="px-6 py-3">NAMA MUSYRIF</th>
                  <th className="px-4 py-3 text-center">KATEGORI</th>
                  <th className="px-4 py-3 text-center">NO. HP</th>
                  <th className="px-4 py-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-6 text-slate-400">Memuat...</td></tr>
                ) : musyrifList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6 text-slate-400">Belum ada data musyrif.</td></tr>
                ) : (
                  musyrifList.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center font-bold text-xs text-slate-500">{idx + 1}</td>
                      <td className="px-6 py-3 font-bold text-[#0c2a57]">{m.nama_musyrif}</td>
                      <td className="px-4 py-3 text-center text-xs">
                        {m.kategori === 'Keduanya' ? (
                          <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg font-bold text-[10px]">Asrama & Al-Qur'an</span>
                        ) : m.kategori === 'Al-Qur\'an' ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold text-[10px]">Al-Qur'an</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-bold text-[10px]">Asrama</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono">{m.no_hp || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(m)}
                            className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.nama_musyrif)}
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
      </div>
    </main>
  );
}