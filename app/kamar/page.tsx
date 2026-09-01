'use client';

import React, { useState, useEffect } from 'react';

interface Kamar {
  id: number;
  tingkat: number;
  nama_asrama: string;
  nomor_kamar: string;
  kapasitas: number;
  musyrif_id: number | null;
  nama_musyrif: string;
}

interface Musyrif {
  id: number;
  nama_musyrif: string;
}

export default function DataKamarPage() {
  const [kamarList, setKamarList] = useState<Kamar[]>([]);
  const [musyrifList, setMusyrifList] = useState<Musyrif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTingkat, setFilterTingkat] = useState('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tingkat: 10,
    nama_asrama: '',
    nomor_kamar: '',
    kapasitas: 10,
    musyrif_id: '',
  });

  const loadData = () => {
    setLoading(true);
    fetch(`/api/kamar?tingkat=${filterTingkat}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setKamarList(data.data);
        setLoading(false);
      });

    fetch('/api/musyrif')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMusyrifList(data.data);
      });
  };

  useEffect(() => {
    loadData();
  }, [filterTingkat]);

  const handleEditClick = (km: Kamar) => {
    setEditingId(km.id);
    setFormData({
      tingkat: km.tingkat || 10,
      nama_asrama: km.nama_asrama,
      nomor_kamar: km.nomor_kamar,
      kapasitas: km.kapasitas,
      musyrif_id: km.musyrif_id ? String(km.musyrif_id) : '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ tingkat: 10, nama_asrama: '', nomor_kamar: '', kapasitas: 10, musyrif_id: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const bodyData = editingId
      ? { id: editingId, ...formData, musyrif_id: formData.musyrif_id ? parseInt(formData.musyrif_id, 10) : null }
      : { ...formData, musyrif_id: formData.musyrif_id ? parseInt(formData.musyrif_id, 10) : null };

    const res = await fetch('/api/kamar', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    const result = await res.json();
    if (result.success) {
      alert(editingId ? 'Data kamar diperbarui!' : 'Data Kamar berhasil disimpan!');
      handleCancelEdit();
      loadData();
    } else {
      alert('Gagal: ' + result.error);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus kamar "${nama}"?`)) return;
    const res = await fetch('/api/kamar', {
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
        <h1 className="text-2xl font-bold text-[#0c2a57]">Data Kamar & Asrama</h1>
        <p className="text-xs text-slate-500">Kelola kamar, alokasi tingkat kelas, dan Musyrif penanggung jawab</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Input/Edit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#0c2a57] mb-4">
            {editingId ? '✏️ Edit Data Kamar' : '+ Tambah Kamar Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Peruntukan Tingkat Kelas</label>
              <select
                value={formData.tingkat}
                onChange={(e) => setFormData({ ...formData, tingkat: parseInt(e.target.value, 10) })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-bold text-blue-700"
              >
                <option value={10}>Kelas 10</option>
                <option value={11}>Kelas 11</option>
                <option value={12}>Kelas 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Asrama / Gedung</label>
              <input
                type="text"
                required
                value={formData.nama_asrama}
                onChange={(e) => setFormData({ ...formData, nama_asrama: e.target.value })}
                placeholder="Contoh: Arofah 1 / Muzda 2"
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Kamar</label>
              <input
                type="text"
                required
                value={formData.nomor_kamar}
                onChange={(e) => setFormData({ ...formData, nomor_kamar: e.target.value })}
                placeholder="Contoh: 110 / 120"
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas (Santri)</label>
              <input
                type="number"
                required
                min={1}
                value={formData.kapasitas}
                onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value, 10) || 10 })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Musyrif Kamar</label>
              <select
                value={formData.musyrif_id}
                onChange={(e) => setFormData({ ...formData, musyrif_id: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-medium"
              >
                <option value="">-- Pilih Musyrif --</option>
                {musyrifList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama_musyrif}
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
                {editingId ? 'Simpan' : 'Simpan Data Kamar'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Data & Dropdown Filter */}
        <div className="md:col-span-2 flex flex-col gap-3">
          {/* Header Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">🔍 Filter Berdasarkan Kelas:</span>
            <select
              value={filterTingkat}
              onChange={(e) => setFilterTingkat(e.target.value)}
              className="border border-slate-300 p-2 rounded-xl text-xs font-bold text-[#0c2a57] bg-slate-50 outline-none"
            >
              <option value="all">Semua Kelas (Tampilkan Semua)</option>
              <option value="10">Kamar Khusus Kelas 10</option>
              <option value="11">Kamar Khusus Kelas 11</option>
              <option value="12">Kamar Khusus Kelas 12</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-xs text-slate-600 uppercase border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3 text-center w-10">NO</th>
                  <th className="px-4 py-3 text-center">TINGKAT</th>
                  <th className="px-6 py-3">ASRAMA</th>
                  <th className="px-4 py-3 text-center">KAMAR</th>
                  <th className="px-6 py-3">MUSYRIF</th>
                  <th className="px-6 py-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-6 text-slate-400">Memuat...</td></tr>
                ) : kamarList.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-slate-400">Tidak ada data kamar.</td></tr>
                ) : (
                  kamarList.map((km, idx) => (
                    <tr key={km.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center font-bold text-xs text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          km.tingkat === 10 ? 'bg-blue-100 text-blue-700' : km.tingkat === 11 ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          Kelas {km.tingkat || 10}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-bold text-[#0c2a57]">{km.nama_asrama}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-emerald-600">{km.nomor_kamar}</td>
                      <td className="px-6 py-3 text-xs font-semibold text-slate-600">{km.nama_musyrif}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(km)}
                            className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(km.id, `${km.nama_asrama} - ${km.nomor_kamar}`)}
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