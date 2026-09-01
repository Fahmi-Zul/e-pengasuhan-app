'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Santri {
  id: number;
  nisn: string;
  nama_santri: string;
  nama_kelas: string;
}

export default function InputPelanggaranPage() {
  const router = useRouter();
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [searchSantri, setSearchSantri] = useState('');
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);

  const [formData, setFormData] = useState({
    kategori: 'Sekolah', // Kategori: 'Sekolah', 'Asrama', 'Al-Qur\'an'
    jenis_pelanggaran: '',
    poin: 5,
    keterangan: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  const [submitting, setSubmitting] = useState(false);

  // Ambil data santri untuk dropdown pencarian
  useEffect(() => {
    fetch('/api/santri')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSantriList(data.data);
      });
  }, []);

  const filteredSantri = searchSantri
    ? santriList.filter(
        (s) =>
          s.nama_santri.toLowerCase().includes(searchSantri.toLowerCase()) ||
          s.nisn.includes(searchSantri) ||
          s.nama_kelas.toLowerCase().includes(searchSantri.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) {
      alert('Pilih santri terlebih dahulu!');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/pelanggaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_santri: selectedSantri.id,
        ...formData,
      }),
    });

    const result = await res.json();
    setSubmitting(false);

    if (result.success) {
      alert('Catatan indisipliner berhasil disimpan!');
      router.push('/pelanggaran');
    } else {
      alert('Gagal menyimpan: ' + result.error);
    }
  };

  return (
    <main className="p-6 bg-[#f4f7fb] min-h-screen text-slate-800">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-[#0c2a57] mb-1">Catat Indisipliner Santri</h1>
        <p className="text-xs text-slate-500 mb-6">Input pelanggaran kategori Sekolah, Asrama, atau Al-Qur'an</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Tanggal & Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Incident</label>
              <input
                type="date"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Ranah</label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white font-medium"
              >
                <option value="Sekolah">🏫 Sekolah</option>
                <option value="Asrama">🏠 Asrama</option>
                <option value="Al-Qur'an">📖 Al-Qur'an</option>
              </select>
            </div>
          </div>

          {/* Cari Santri */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Santri</label>
            {selectedSantri ? (
              <div className="flex justify-between items-center p-3 border border-emerald-300 bg-emerald-50 rounded-xl">
                <div>
                  <p className="font-bold text-[#0c2a57] text-sm">{selectedSantri.nama_santri}</p>
                  <p className="text-xs text-slate-500">
                    Kelas: {selectedSantri.nama_kelas} | NISN: {selectedSantri.nisn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSantri(null)}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik Nama atau NISN Santri..."
                  value={searchSantri}
                  onChange={(e) => setSearchSantri(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white"
                />
                {filteredSantri.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {filteredSantri.map((s) => (
                      <li
                        key={s.id}
                        onClick={() => {
                          setSelectedSantri(s);
                          setSearchSantri('');
                        }}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 text-xs flex justify-between"
                      >
                        <span className="font-bold text-[#0c2a57]">{s.nama_santri}</span>
                        <span className="text-slate-500">{s.nama_kelas}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Detail Pelanggaran & Poin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pelanggaran</label>
              <input
                type="text"
                required
                placeholder="Contoh: Terlambat Masuk Kelas / Tidak Mufrodat"
                value={formData.jenis_pelanggaran}
                onChange={(e) => setFormData({ ...formData, jenis_pelanggaran: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bobot Poin</label>
              <input
                type="number"
                required
                min={1}
                value={formData.poin}
                onChange={(e) => setFormData({ ...formData, poin: parseInt(e.target.value, 10) || 0 })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white font-bold text-red-600"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Catatan Tambahan</label>
            <textarea
              rows={3}
              placeholder="Catatan detail kronologi indisipliner..."
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-semibold bg-[#2c6ddf] text-white rounded-xl hover:bg-[#1a55be] shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Simpan...' : 'Simpan Pelanggaran'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}