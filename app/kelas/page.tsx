'use client';

import React, { useState, useEffect } from 'react';

interface Kelas {
  id: number;
  tingkat: number;
  nama_kelas: string;
  wali_kelas_id: number | null;
  nama_wali_kelas: string;
}

interface Guru {
  id: number;
  nama_guru: string;
}

export default function DataKelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama_kelas: '', wali_kelas_id: '' });

  const loadData = () => {
    setLoading(true);
    fetch('/api/kelas')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setKelasList(data.data);
        setLoading(false);
      });

    fetch('/api/guru')
      .then((res) => {
        if (!res.ok) return { success: false, data: [] };
        return res.json();
      })
      .then((data) => {
        if (data && data.success) setGuruList(data.data);
      })
      .catch((err) => console.error("Error loading guru:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (k: Kelas) => {
    setEditingId(k.id);
    setFormData({
      nama_kelas: k.nama_kelas,
      wali_kelas_id: k.wali_kelas_id ? String(k.wali_kelas_id) : '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ nama_kelas: '', wali_kelas_id: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const bodyData = editingId
      ? { id: editingId, nama_kelas: formData.nama_kelas, wali_kelas_id: formData.wali_kelas_id ? parseInt(formData.wali_kelas_id, 10) : null }
      : { nama_kelas: formData.nama_kelas, wali_kelas_id: formData.wali_kelas_id ? parseInt(formData.wali_kelas_id, 10) : null };

    const res = await fetch('/api/kelas', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    const result = await res.json();
    if (result.success) {
      alert(editingId ? 'Data kelas diperbarui!' : 'Kelas berhasil ditambahkan!');
      handleCancelEdit();
      loadData();
    } else {
      alert('Gagal: ' + result.error);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus kelas "${nama}"?`)) return;
    const res = await fetch('/api/kelas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.success) {
      loadData();
    } else {
      alert('Gagal menghapus: ' + result.error);
    }
  };

  return (
    <main className="p-6 bg-[#f4f7fb] min-h-screen text-slate-800">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-[#0c2a57]">Data Kelas</h1>
        <p className="text-xs text-slate-500">Kelola daftar kelas beserta penugasan Wali Kelas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#0c2a57] mb-4">
            {editingId ? '✏️ Edit Data Kelas' : '+ Tambah Kelas Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelas</label>
              <input
                type="text"
                required
                value={formData.nama_kelas}
                onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                placeholder="Contoh: 10 A / 11 MIPA B"
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Wali Kelas</label>
              <select
                value={formData.wali_kelas_id}
                onChange={(e) => setFormData({ ...formData, wali_kelas_id: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-medium"
              >
                <option value="">-- Pilih Wali Kelas (Opsional) --</option>
                {guruList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama_guru}
                  </option>
                ))}
              </select>
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
                {editingId ? 'Simpan' : 'Simpan Data Kelas'}
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-600 uppercase border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-10">NO</th>
                <th className="px-6 py-3">TINGKAT</th>
                <th className="px-6 py-3">NAMA KELAS</th>
                <th className="px-6 py-3">WALI KELAS</th>
                <th className="px-6 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6 text-slate-400">Memuat...</td></tr>
              ) : kelasList.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-slate-400">Belum ada data kelas.</td></tr>
              ) : (
                kelasList.map((k, idx) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-center font-bold text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-3 text-xs font-bold text-blue-600">Kelas {k.tingkat}</td>
                    <td className="px-6 py-3 font-bold text-[#0c2a57]">{k.nama_kelas}</td>
                    <td className="px-6 py-3 text-xs font-semibold text-slate-600">{k.nama_wali_kelas}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(k)}
                          className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(k.id, k.nama_kelas)}
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