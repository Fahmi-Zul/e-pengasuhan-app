'use client';

import React, { useState, useEffect } from 'react';

interface Santri {
  id: number;
  nisn: string;
  nama_santri: string;
  nama_kelas: string;
  status_aktif: boolean;
}

export default function DataSantriPage() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Santri | null>(null);
  const [formData, setFormData] = useState({ nisn: '', nama_santri: '', nama_kelas: '' });

  // Selection State (Hapus Massal)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadData = () => {
    setLoading(true);
    fetch('/api/santri')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSantriList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({ nisn: '', nama_santri: '', nama_kelas: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (santri: Santri) => {
    setEditItem(santri);
    setFormData({
      nisn: santri.nisn,
      nama_santri: santri.nama_santri,
      nama_kelas: santri.nama_kelas === '-' ? '' : santri.nama_kelas,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editItem ? 'PUT' : 'POST';
    const bodyData = editItem ? { id: editItem.id, ...formData } : formData;

    const res = await fetch('/api/santri', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    const result = await res.json();

    if (result.success) {
      alert(editItem ? 'Data santri berhasil diperbarui!' : 'Santri berhasil ditambahkan!');
      setIsModalOpen(false);
      loadData();
    } else {
      alert('Gagal menyimpan data: ' + result.error);
    }
  };

  const handleDeleteSingle = async (id: number, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus santri "${nama}"?`)) return;

    const res = await fetch('/api/santri', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
    const result = await res.json();

    if (result.success) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
      loadData();
    } else {
      alert('Gagal menghapus: ' + result.error);
    }
  };

  const handleDeleteBatch = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data santri terpilih?`)) return;

    const res = await fetch('/api/santri', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });
    const result = await res.json();

    if (result.success) {
      alert(`Berhasil menghapus ${selectedIds.length} santri.`);
      setSelectedIds([]);
      loadData();
    } else {
      alert('Gagal menghapus massal: ' + result.error);
    }
  };

  const handleImportExcel = async () => {
    if (!confirm('Apakah Anda yakin ingin mengimpor dan mereset data santri dari file Excel?')) return;

    const res = await fetch('/api/santri/import', { method: 'POST' });
    const result = await res.json();

    if (result.success) {
      alert(result.message);
      loadData();
    } else {
      alert('Gagal impor: ' + result.error);
    }
  };

  const filteredSantri = santriList.filter(
    (s) =>
      s.nama_santri.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.includes(search) ||
      (s.nama_kelas && s.nama_kelas.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSantri.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <main className="p-6 bg-[#f4f7fb] min-h-screen text-slate-800">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0c2a57]">Data Santri</h1>
          <p className="text-xs text-slate-500">Kelola, edit, dan hapus data santri secara presisi</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteBatch}
              className="bg-red-600 text-white text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition shadow-sm flex items-center gap-1"
            >
              🗑️ Hapus ({selectedIds.length}) Terpilih
            </button>
          )}
          <button
            onClick={handleImportExcel}
            className="bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-sm"
          >
            📥 Import Data Excel Real
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-[#2c6ddf] text-white text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-[#1a55be] transition shadow-sm"
          >
            + Tambah Santri Baru
          </button>
        </div>
      </div>

      {/* Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 shadow-sm">
        <input
          type="text"
          placeholder="Cari nama santri, NISN, atau kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-300 p-2.5 rounded-xl outline-none text-sm text-slate-900 focus:ring-2 focus:ring-[#2c6ddf]"
        />
      </div>

      {/* Tabel Santri */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-xs text-slate-600 uppercase border-b border-slate-200 font-bold">
            <tr>
              <th className="px-4 py-4 text-center w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredSantri.length > 0 && selectedIds.length === filteredSantri.length}
                  className="rounded border-slate-300 text-[#2c6ddf] focus:ring-[#2c6ddf] cursor-pointer"
                />
              </th>
              <th className="px-4 py-4 text-center w-12">NO</th>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4">NAMA SANTRI</th>
              <th className="px-6 py-4">KELAS</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">Memuat data...</td>
              </tr>
            ) : filteredSantri.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">Data santri belum ada.</td>
              </tr>
            ) : (
              filteredSantri.map((santri, index) => (
                <tr key={santri.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(santri.id)}
                      onChange={() => handleSelectOne(santri.id)}
                      className="rounded border-slate-300 text-[#2c6ddf] focus:ring-[#2c6ddf] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-xs text-slate-500">{index + 1}</td>
                  <td className="px-6 py-4 font-mono text-xs">{santri.nisn}</td>
                  <td className="px-6 py-4 font-bold text-[#0c2a57]">{santri.nama_santri}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">{santri.nama_kelas || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                      Aktif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(santri)}
                        className="p-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-100 text-xs font-semibold"
                        title="Edit Data"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(santri.id, santri.nama_santri)}
                        className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-xs font-semibold"
                        title="Hapus Data"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Input / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md border border-slate-200">
            <h2 className="text-lg font-bold text-[#0c2a57] mb-4">
              {editItem ? 'Edit Data Santri' : 'Tambah Santri Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NISN</label>
                <input
                  type="text"
                  required
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  placeholder="Contoh: 0051234567"
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Santri</label>
                <input
                  type="text"
                  required
                  value={formData.nama_santri}
                  onChange={(e) => setFormData({ ...formData, nama_santri: e.target.value })}
                  placeholder="Contoh: Muhammad Syakir"
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                <input
                  type="text"
                  required
                  value={formData.nama_kelas}
                  onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                  placeholder="Contoh: 10 A / 12 TEKNIK B"
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white text-slate-900"
                />
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#2c6ddf] text-white rounded-xl hover:bg-[#1a55be]"
                >
                  {editItem ? 'Simpan Perubahan' : 'Simpan Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}