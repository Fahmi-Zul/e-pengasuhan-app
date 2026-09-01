'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Kelas {
  id: number;
  nama_kelas: string;
}

interface Guru {
  id: number;
  nama_guru: string;
}

interface Santri {
  id: number;
  nama_santri: string;
  id_kelas: number;
  nama_kelas: string;
}

interface Pelanggaran {
  id: number;
  santri_id: number;
  nama_santri: string;
  nama_kelas: string;
  ranah: string;
  jenis_pelanggaran: string;
  poin: number;
  tanggal: string;
  waktu: string;
  sesi_waktu: string;
  guru_pelapor_id?: number;
  guru_pelapor: string;
  keterangan: string;
}

const BENTUK_PELANGGARAN_MAP: Record<string, string[]> = {
  sekolah: [
    'Tidak menggunakan seragam sesuai dengan ketentuan hari',
    'Melepas atau menonaktifkan MDM pada perangkat',
    'Tidak hadir sekolah tanpa keterangan',
    'Tidak rapi dalam mengenakan seragam',
    'Membuang sampah sembarangan di sekitar sekolah',
    'Tidak mengembalikan iPad sesuai dengan ketentuan yang berlaku',
    'Vandalisme',
    'Meninggalkan ruang kelas saat pelajaran berlangsung tanpa keterangan',
    'Menggunakan akun siswa lain',
    'Tidak sholat Dhuha',
    'Lainnya (Ketik Manual)',
  ],
  asrama: [
    'Terlambat hadir shalat berjamaah di masjid',
    'Tidak menjaga kebersihan dan membuang sampah sembarangan',
    'Terlambat hadir dalam kegiatan sekolah atau ta\'limul Qur\'an',
    'Tidak rapi dan melanggar ketentuan kerapihan pribadi',
    'Melakukan bullying secara verbal',
    'Meninggalkan sholat fardhu berjama\'ah di masjid secara sengaja tanpa udzur syar\'i',
    'Mencuri uang atau barang dengan akumulasi nilai paling banyak Rp. 100.000',
    'Memasuki ruangan lewat jendela tanpa ada alasan syari',
    'Tidak hadir dalam pengabsenan malam',
    'Melakukan transaksi jual beli di asrama',
    'Membawa, menyimpan, memiliki, dan/atau menghisap rokok, vape, atau alat sejenis',
    'Keluar pesantren tanpa izin atau kabur',
    'Melakukan penyidangan gelap maupun terbuka',
    'Melakukan perilaku penyimpangan seksual',
    'Merusak atau mengakibatkan rusaknya fasilitas milik guru, pegawai dan atau pesantren',
    'Berkata kasar/toxiit',
    'Membawa IPAD ke asrama',
    'Vandalisme',
    'Tidak Sholat Tahajjud',
    'Tidak Qiyyamullail',
    'Tidak sholat witir',
    'Tidur bersama dalam satu ranjang',
    'Lainnya (Ketik Manual)',
  ],
  quran: [
    'Tidak hadir kegiatan Ta\'limul Qur\'an tanpa udzur syar\'i',
    'Meninggalkan kegiatan Ta\'limul Qur\'an tanpa izin',
    'Vandalisme',
    'Tidak mengikuti mabit',
    'Lainnya (Ketik Manual)',
  ],
};

const OPSI_SESI_MAP: Record<string, string[]> = {
  sekolah: ['Keberangkatan Sekolah', 'KBM', 'Istirahat'],
  asrama: ['SHUBUH', 'JAM SEKOLAH', 'ASHAR', 'MAGHRIB', 'MALAM'],
  quran: ['HALAQOH SHUBUH', 'HALAQOH ASHAR', 'HALAQOH MAGHRIB'],
};

const OPSI_TEMPAT_ASRAMA = ['KAMAR', 'KORIDOR ASRAMA', 'KAMAR MANDI', 'SEKOLAH'];

function PelanggaranContent() {
  const searchParams = useSearchParams();
  const ranah = searchParams.get('ranah') || 'sekolah';

  const [pelanggaranList, setPelanggaranList] = useState<Pelanggaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [allSantri, setAllSantri] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Input / Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedKelasId, setSelectedKelasId] = useState<string>('');
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [selectedSantriNama, setSelectedSantriNama] = useState<string>('');
  const [searchSantriText, setSearchSantriText] = useState('');
  
  const [selectedSesiWaktu, setSelectedSesiWaktu] = useState('');
  const [selectedTempatAsrama, setSelectedTempatAsrama] = useState('');
  const [selectedJenisOpsi, setSelectedJenisOpsi] = useState('');
  const [customJenis, setCustomJenis] = useState('');

  const [formData, setFormData] = useState({
    guru_pelapor_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: new Date().toTimeString().slice(0, 5),
    poin: 5,
    keterangan: '',
  });

  const loadData = () => {
    setLoading(true);
    fetch(`/api/pelanggaran?ranah=${ranah}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPelanggaranList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/kelas')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setKelasList(data.data);
      });

    fetch('/api/guru')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGuruList(data.data);
      });

    fetch('/api/santri')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAllSantri(data.data);
      });
  };

  useEffect(() => {
    loadData();
    handleCancelEdit();
  }, [ranah]);

  const selectedKelasObj = kelasList.find((k) => Number(k.id) === Number(selectedKelasId));
  const currentJenisList = BENTUK_PELANGGARAN_MAP[ranah] || BENTUK_PELANGGARAN_MAP['sekolah'];
  const currentSesiList = OPSI_SESI_MAP[ranah] || OPSI_SESI_MAP['sekolah'];

  const santriByKelas = selectedKelasId
    ? allSantri.filter((s) => {
        const matchId = Number(s.id_kelas) === Number(selectedKelasId);
        const matchNama =
          selectedKelasObj &&
          s.nama_kelas &&
          String(s.nama_kelas).trim().toLowerCase() === String(selectedKelasObj.nama_kelas).trim().toLowerCase();
        return matchId || matchNama;
      })
    : [];

  const filteredSantriResult = searchSantriText.trim() === ''
    ? santriByKelas
    : santriByKelas.filter((s) =>
        s.nama_santri.toLowerCase().includes(searchSantriText.toLowerCase())
      );

  const handleSelectSantri = (s: Santri) => {
    setSelectedSantriId(String(s.id));
    setSelectedSantriNama(s.nama_santri);
    setSearchSantriText('');
  };

  const handleEditClick = (p: Pelanggaran) => {
    setEditingId(p.id);

    const targetSantri = allSantri.find((s) => Number(s.id) === Number(p.santri_id));
    const kId = targetSantri ? String(targetSantri.id_kelas) : '';

    setSelectedKelasId(kId);
    setSelectedSantriId(String(p.santri_id));
    setSelectedSantriNama(p.nama_santri);

    setSelectedSesiWaktu(p.sesi_waktu || '');

    setFormData({
      guru_pelapor_id: String(p.guru_pelapor_id || ''),
      tanggal: p.tanggal,
      waktu: p.waktu,
      poin: p.poin,
      keterangan: p.keterangan || '',
    });

    if (currentJenisList.includes(p.jenis_pelanggaran)) {
      setSelectedJenisOpsi(p.jenis_pelanggaran);
      setCustomJenis('');
    } else {
      setSelectedJenisOpsi('Lainnya (Ketik Manual)');
      setCustomJenis(p.jenis_pelanggaran);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedKelasId('');
    setSelectedSantriId('');
    setSelectedSantriNama('');
    setSearchSantriText('');
    setSelectedSesiWaktu('');
    setSelectedTempatAsrama('');
    setSelectedJenisOpsi('');
    setCustomJenis('');
    setFormData({
      guru_pelapor_id: '',
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toTimeString().slice(0, 5),
      poin: 5,
      keterangan: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guru_pelapor_id) {
      alert('Pilih Guru Pelapor terlebih dahulu!');
      return;
    }

    if (!selectedSantriId) {
      alert('Silakan cari & pilih Santri terlebih dahulu!');
      return;
    }

    const finalJenisPelanggaran =
      selectedJenisOpsi === 'Lainnya (Ketik Manual)' ? customJenis : selectedJenisOpsi;

    if (!finalJenisPelanggaran || !finalJenisPelanggaran.trim()) {
      alert('Pilih atau ketik Jenis Pelanggaran!');
      return;
    }

    let finalKeterangan = formData.keterangan;
    if (ranah === 'asrama' && selectedTempatAsrama) {
      finalKeterangan = `[Lokasi: ${selectedTempatAsrama}] ${formData.keterangan}`.trim();
    }

    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId
      ? {
          id: editingId,
          santri_id: parseInt(selectedSantriId, 10),
          ranah,
          jenis_pelanggaran: finalJenisPelanggaran,
          poin: formData.poin,
          tanggal: formData.tanggal,
          waktu: formData.waktu,
          sesi_waktu: selectedSesiWaktu || '-',
          guru_pelapor_id: parseInt(formData.guru_pelapor_id, 10),
          keterangan: finalKeterangan,
        }
      : {
          santri_id: parseInt(selectedSantriId, 10),
          ranah,
          jenis_pelanggaran: finalJenisPelanggaran,
          poin: formData.poin,
          tanggal: formData.tanggal,
          waktu: formData.waktu,
          sesi_waktu: selectedSesiWaktu || '-',
          guru_pelapor_id: parseInt(formData.guru_pelapor_id, 10),
          keterangan: finalKeterangan,
        };

    const res = await fetch('/api/pelanggaran', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.success) {
      alert(editingId ? 'Catatan Pelanggaran Diperbarui!' : 'Catatan Pelanggaran Disimpan!');
      handleCancelEdit();
      loadData();
    } else {
      alert('Gagal: ' + result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus catatan pelanggaran ini?')) return;
    const res = await fetch('/api/pelanggaran', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.success) loadData();
  };

  const titleRanah = ranah === 'asrama' ? 'Asrama' : ranah === 'quran' ? 'Al-Qur\'an' : 'Sekolah';

  return (
    <main className="p-6 bg-[#f4f7fb] min-h-screen text-slate-800">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0c2a57]">Catatan Indisipliner - Ranah {titleRanah}</h1>
          <p className="text-xs text-slate-500">Pencatatan poin kedisiplinan santri khusus bidang {titleRanah.toLowerCase()}</p>
        </div>
        <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide">
          BIDANG {titleRanah.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Input / Edit Pelanggaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#0c2a57] mb-4">
            {editingId ? '✏️ Edit Catatan Pelanggaran' : `+ Input Pelanggaran ${titleRanah}`}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* 1. Tanggal & Waktu (Time Input) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TANGGAL</label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">JAM KEJADIAN</label>
                <input
                  type="time"
                  required
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            {/* 2. Sesi Waktu / Kondisi Kejadian */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">KONDISI / SESI WAKTU</label>
              <select
                required
                value={selectedSesiWaktu}
                onChange={(e) => setSelectedSesiWaktu(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-medium text-slate-700"
              >
                <option value="">-- Pilih Sesi / Kondisi --</option>
                {currentSesiList.map((w, idx) => (
                  <option key={idx} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* OPSI KHUSUS ASRAMA: TEMPAT PELANGGARAN */}
            {ranah === 'asrama' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ASRAMA - TEMPAT PELANGGARAN</label>
                <select
                  value={selectedTempatAsrama}
                  onChange={(e) => setSelectedTempatAsrama(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-medium text-slate-700"
                >
                  <option value="">-- Pilih Tempat --</option>
                  {OPSI_TEMPAT_ASRAMA.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Guru Pelapor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GURU / UST. PELAPOR</label>
              <select
                required
                value={formData.guru_pelapor_id}
                onChange={(e) => setFormData({ ...formData, guru_pelapor_id: e.target.value })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-medium text-slate-700"
              >
                <option value="">-- Pilih Guru / Pelapor --</option>
                {guruList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama_guru}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Select Kelas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PILIH KELAS SANTRI</label>
              <select
                required
                value={selectedKelasId}
                onChange={(e) => {
                  setSelectedKelasId(e.target.value);
                  setSelectedSantriId('');
                  setSelectedSantriNama('');
                  setSearchSantriText('');
                }}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white font-bold text-[#0c2a57]"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kelas {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Search By Name Santri */}
            {selectedKelasId && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 relative">
                <span className="text-xs font-bold text-blue-900">
                  🔍 Cari Santri Kelas {selectedKelasObj?.nama_kelas}:
                </span>

                <input
                  type="text"
                  value={searchSantriText}
                  onChange={(e) => setSearchSantriText(e.target.value)}
                  placeholder="Ketik nama santri..."
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs outline-none bg-white font-medium"
                />

                {selectedSantriNama && (
                  <div className="mt-1 p-2 bg-blue-100 border border-blue-200 rounded-lg flex justify-between items-center text-xs font-bold text-blue-900">
                    <span>Terpilih: {selectedSantriNama}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSantriId('');
                        setSelectedSantriNama('');
                      }}
                      className="text-red-600 hover:text-red-800 font-bold ml-2"
                    >
                      ×
                    </button>
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
                          className="w-full text-left p-2.5 text-xs hover:bg-blue-50 border-b border-slate-100 flex justify-between font-semibold"
                        >
                          <span className="text-[#0c2a57]">{s.nama_santri}</span>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">Pilih</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6. Select BENTUK PELANGGARAN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">BENTUK PELANGGARAN</label>
              <select
                required
                value={selectedJenisOpsi}
                onChange={(e) => setSelectedJenisOpsi(e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none bg-white text-slate-800 font-medium"
              >
                <option value="">-- Pilih Bentuk Pelanggaran --</option>
                {currentJenisList.map((o, idx) => (
                  <option key={idx} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {selectedJenisOpsi === 'Lainnya (Ketik Manual)' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ketik Bentuk Pelanggaran</label>
                <input
                  type="text"
                  required
                  value={customJenis}
                  onChange={(e) => setCustomJenis(e.target.value)}
                  placeholder="Ketik rincian pelanggaran..."
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">BOBOT POIN</label>
              <input
                type="number"
                required
                min={1}
                value={formData.poin}
                onChange={(e) => setFormData({ ...formData, poin: parseInt(e.target.value, 10) || 0 })}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none font-bold text-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">KETERANGAN / CATATAN TAMBAHAN</label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Catatan penanganan..."
                className="w-full border border-slate-300 p-2.5 rounded-xl text-xs outline-none h-16"
              />
            </div>

            <div className="flex gap-2 mt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/2 bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className={`${editingId ? 'w-1/2 bg-amber-600 hover:bg-amber-700' : 'w-full bg-red-600 hover:bg-red-700'} text-white text-xs py-2.5 rounded-xl font-semibold transition`}
              >
                {editingId ? 'Simpan' : 'Simpan Catatan Pelanggaran'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Riwayat Pelanggaran */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-600 uppercase border-b border-slate-200 font-bold">
              <tr>
                <th className="px-3 py-3 text-center w-8">NO</th>
                <th className="px-4 py-3">WAKTU & PELAPOR</th>
                <th className="px-5 py-3">NAMA SANTRI</th>
                <th className="px-5 py-3">PELANGGARAN</th>
                <th className="px-3 py-3 text-center">POIN</th>
                <th className="px-4 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6 text-slate-400">Memuat...</td></tr>
              ) : pelanggaranList.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-slate-400">Belum ada pelanggaran dicatat di ranah {titleRanah}.</td></tr>
              ) : (
                pelanggaranList.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 text-center font-bold text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-mono font-bold text-slate-700">{p.tanggal} ({p.waktu})</span>
                      <span className="block text-[11px] font-bold text-blue-700 uppercase">{p.sesi_waktu}</span>
                      <span className="block text-[10px] text-emerald-700 font-semibold">Pelapor: {p.guru_pelapor}</span>
                    </td>
                    <td className="px-5 py-3 font-bold text-[#0c2a57]">
                      {p.nama_santri}
                      <span className="block text-[10px] text-slate-400 font-normal">Kelas {p.nama_kelas}</span>
                    </td>
                    <td className="px-5 py-3 text-xs">
                      <span className="font-semibold text-slate-800">{p.jenis_pelanggaran}</span>
                      {p.keterangan && <span className="block text-[10px] text-slate-400 italic">{p.keterangan}</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="bg-red-100 text-red-700 font-black text-xs px-2 py-1 rounded-lg">
                        +{p.poin}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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

export default function PelanggaranPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Loading Pelanggaran...</div>}>
      <PelanggaranContent />
    </Suspense>
  );
}