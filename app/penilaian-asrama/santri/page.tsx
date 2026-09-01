'use client';

import React, { useState, useEffect } from 'react';

interface Musyrif {
  id: number;
  nama_musyrif: string;
}

interface Santri {
  id: number;
  nama_santri: string;
}

interface MasterKamar {
  id: number;
  tingkat: number;
  nama_asrama: string;
  nomor_kamar: string;
}

interface PenilaianSantri {
  id: number;
  santri_id: number;
  nama_santri: string;
  asrama: string;
  nama_kamar?: string;
  musyrif_id?: number;
  nama_musyrif: string;
  tanggal: string;
  aspek_1: number;
  aspek_2: number;
  aspek_3: number;
  aspek_4: number;
  aspek_5: number;
  aspek_6: number;
  rata_rata: number;
  catatan: string;
}

export default function KedisiplinanSantriPage() {
  const [dataList, setDataList] = useState<PenilaianSantri[]>([]);
  const [musyrifList, setMusyrifList] = useState<Musyrif[]>([]);
  const [allSantri, setAllSantri] = useState<Santri[]>([]);
  const [masterKamarList, setMasterKamarList] = useState<MasterKamar[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedAsrama, setSelectedAsrama] = useState<string>('');
  const [selectedNomorKamar, setSelectedNomorKamar] = useState<string>('');
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [selectedSantriNama, setSelectedSantriNama] = useState<string>('');
  const [searchSantriText, setSearchSantriText] = useState('');

  const [formData, setFormData] = useState({
    musyrif_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    aspek_1: 4,
    aspek_2: 4,
    aspek_3: 4,
    aspek_4: 4,
    aspek_5: 4,
    aspek_6: 4,
    catatan: '',
  });

  const loadData = () => {
    setLoading(true);
    fetch('/api/penilaian-asrama?tipe=SANTRI')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDataList(data.data);
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

    fetch('/api/kamar')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMasterKamarList(data.data);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const listAsramaUnik = Array.from(new Set(masterKamarList.map((k) => k.nama_asrama)));

  const filteredKamar = selectedAsrama
    ? masterKamarList.filter((k) => k.nama_asrama === selectedAsrama)
    : [];

  const filteredSantriResult = searchSantriText.trim() === ''
    ? allSantri
    : allSantri.filter((s) => s.nama_santri.toLowerCase().includes(searchSantriText.toLowerCase()));

  const handleSelectSantri = (s: Santri) => {
    setSelectedSantriId(String(s.id));
    setSelectedSantriNama(s.nama_santri);
    setSearchSantriText('');
  };

  const handleEdit = (p: PenilaianSantri) => {
    setEditingId(p.id);
    setSelectedAsrama(p.asrama);
    setSelectedNomorKamar(p.nama_kamar || '');
    setSelectedSantriId(String(p.santri_id));
    setSelectedSantriNama(p.nama_santri);
    setFormData({
      musyrif_id: String(p.musyrif_id || ''),
      tanggal: p.tanggal,
      aspek_1: p.aspek_1,
      aspek_2: p.aspek_2,
      aspek_3: p.aspek_3,
      aspek_4: p.aspek_4,
      aspek_5: p.aspek_5,
      aspek_6: p.aspek_6,
      catatan: p.catatan || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setSelectedAsrama('');
    setSelectedNomorKamar('');
    setSelectedSantriId('');
    setSelectedSantriNama('');
    setSearchSantriText('');
    setFormData({
      musyrif_id: '',
      tanggal: new Date().toISOString().split('T')[0],
      aspek_1: 4,
      aspek_2: 4,
      aspek_3: 4,
      aspek_4: 4,
      aspek_5: 4,
      aspek_6: 4,
      catatan: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantriId || !selectedAsrama || !selectedNomorKamar) {
      alert('Pilih Asrama, Nomor Kamar, dan Santri terlebih dahulu!');
      return;
    }

    const payload = {
      tipe_penilaian: 'SANTRI',
      asrama: selectedAsrama,
      nama_kamar: selectedNomorKamar,
      santri_id: selectedSantriId,
      ...formData,
    };

    const method = editingId ? 'PUT' : 'POST';
    const bodyData = editingId ? { id: editingId, ...payload } : payload;

    const res = await fetch('/api/penilaian-asrama', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    const result = await res.json();
    if (result.success) {
      alert(editingId ? 'Penilaian Karakter Santri Diperbarui!' : 'Penilaian Karakter Santri Disimpan!');
      handleCancel();
      loadData();
    } else {
      alert('Gagal: ' + result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus penilaian santri ini?')) return;
    const res = await fetch('/api/penilaian-asrama', {
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
        <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">Penilaian Personality & Karakter Santri</h1>
        <p className="text-xs text-slate-400">Sinkronisasi Real-Time dengan Master Data Kamar & Asrama</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#1e293b] mb-4">
            {editingId ? '✏️ Edit Personality Santri' : '📋 Input Personality Santri'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">TANGGAL EVALUASI</label>
              <input
                type="date"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">MUSYRIF PENILAI</label>
              <select
                value={formData.musyrif_id}
                onChange={(e) => setFormData({ ...formData, musyrif_id: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-white font-medium"
              >
                <option value="">-- Pilih Musyrif --</option>
                {musyrifList.map((m) => (
                  <option key={m.id} value={m.id}>{m.nama_musyrif}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ASRAMA SANTRI</label>
              <select
                required
                value={selectedAsrama}
                onChange={(e) => {
                  setSelectedAsrama(e.target.value);
                  setSelectedNomorKamar('');
                }}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-white font-bold text-[#1e293b]"
              >
                <option value="">-- Pilih Asrama --</option>
                {listAsramaUnik.map((asramaName) => (
                  <option key={asramaName} value={asramaName}>{asramaName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">NOMOR KAMAR</label>
              <select
                required
                value={selectedNomorKamar}
                onChange={(e) => setSelectedNomorKamar(e.target.value)}
                disabled={!selectedAsrama}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none bg-white font-bold text-[#1e293b] disabled:bg-slate-100"
              >
                <option value="">{selectedAsrama ? '-- Pilih Nomor Kamar --' : 'Pilih Asrama Terlebih Dahulu'}</option>
                {filteredKamar.map((k) => (
                  <option key={k.id} value={k.nomor_kamar}>{k.nomor_kamar}</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 relative">
              <span className="text-xs font-bold text-indigo-900">🔍 Pilih Santri:</span>
              <input
                type="text"
                value={searchSantriText}
                onChange={(e) => setSearchSantriText(e.target.value)}
                placeholder="Ketik nama santri..."
                className="w-full border border-slate-200 p-2 rounded-lg text-xs outline-none bg-white"
              />

              {selectedSantriNama && (
                <div className="mt-1 p-2 bg-indigo-100 border border-indigo-200 rounded-lg flex justify-between items-center text-xs font-bold text-indigo-900">
                  <span>Terpilih: {selectedSantriNama}</span>
                  <button type="button" onClick={() => { setSelectedSantriId(''); setSelectedSantriNama(''); }} className="text-red-600 font-bold ml-2">×</button>
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
                        className="w-full text-left p-2.5 text-xs hover:bg-indigo-50 border-b border-slate-100 flex justify-between font-semibold"
                      >
                        <span>{s.nama_santri}</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold">Pilih</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Presensi & Salat</label>
                <select value={formData.aspek_1} onChange={(e) => setFormData({ ...formData, aspek_1: parseInt(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold text-indigo-600 bg-white">
                  <option value={4}>4 (Sangat Baik)</option><option value={3}>3 (Baik)</option><option value={2}>2 (Cukup)</option><option value={1}>1 (Perlu Pembinaan)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Adab & Sopan Santun</label>
                <select value={formData.aspek_2} onChange={(e) => setFormData({ ...formData, aspek_2: parseInt(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold text-indigo-600 bg-white">
                  <option value={4}>4 (Sangat Baik)</option><option value={3}>3 (Baik)</option><option value={2}>2 (Cukup)</option><option value={1}>1 (Perlu Pembinaan)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Kedisiplinan Waktu</label>
                <select value={formData.aspek_3} onChange={(e) => setFormData({ ...formData, aspek_3: parseInt(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold text-indigo-600 bg-white">
                  <option value={4}>4 (Sangat Baik)</option><option value={3}>3 (Baik)</option><option value={2}>2 (Cukup)</option><option value={1}>1 (Perlu Pembinaan)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Tanggung Jawab</label>
                <select value={formData.aspek_4} onChange={(e) => setFormData({ ...formData, aspek_4: parseInt(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold text-indigo-600 bg-white">
                  <option value={4}>4 (Sangat Baik)</option><option value={3}>3 (Baik)</option><option value={2}>2 (Cukup)</option><option value={1}>1 (Perlu Pembinaan)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Kerapihan Berpakaian</label>
                <select value={formData.aspek_5} onChange={(e) => setFormData({ ...formData, aspek_5: parseInt(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold text-indigo-600 bg-white">
                  <option value={4}>4 (Sangat Baik)</option><option value={3}>3 (Baik)</option><option value={2}>2 (Cukup)</option><option value={1}>1 (Perlu Pembinaan)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Kontrol Emosi</label>
                <select value={formData.aspek_6} onChange={(e) => setFormData({ ...formData, aspek_6: parseInt(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold text-indigo-600 bg-white">
                  <option value={4}>4 (Sangat Baik)</option><option value={3}>3 (Baik)</option><option value={2}>2 (Cukup)</option><option value={1}>1 (Perlu Pembinaan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">CATATAN KARAKTER</label>
              <textarea value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} placeholder="Catatan kepribadian santri..." className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none h-16" />
            </div>

            <div className="flex gap-2 mt-2">
              {editingId && (
                <button type="button" onClick={handleCancel} className="w-1/2 bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl font-bold">Batal</button>
              )}
              <button type="submit" className={`${editingId ? 'w-1/2 bg-amber-600' : 'w-full bg-[#4f46e5]'} text-white text-xs py-2.5 rounded-xl font-bold shadow-md`}>
                {editingId ? 'Simpan Edit' : 'Simpan Penilaian'}
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 text-center w-8">NO</th>
                <th className="px-4 py-3">NAMA SANTRI & LOKASI</th>
                <th className="px-4 py-3 text-center">SKOR (6 ASPEK)</th>
                <th className="px-4 py-3 text-center">RATA-RATA</th>
                <th className="px-4 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6 text-slate-400">Memuat data...</td></tr>
              ) : dataList.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-slate-400">Belum ada riwayat penilaian karakter santri.</td></tr>
              ) : (
                dataList.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 align-top">
                    <td className="px-3 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#1e293b] text-sm">{p.nama_santri}</div>
                      <div className="text-[10px] text-indigo-600 font-semibold mb-1">
                        Asrama: {p.asrama} {p.nama_kamar ? `(Kamar ${p.nama_kamar})` : ''} | 👨‍🏫 Musyrif: {p.nama_musyrif}
                      </div>
                      <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 italic">
                        <span className="font-bold not-italic text-[10px] text-slate-400 uppercase block mb-0.5">Catatan Karakter:</span>
                        {p.catatan ? p.catatan : <span className="text-slate-300 not-italic">- Tidak ada catatan -</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-[11px] pt-4">
                      {p.aspek_1} / {p.aspek_2} / {p.aspek_3} / {p.aspek_4} / {p.aspek_5} / {p.aspek_6}
                    </td>
                    <td className="px-4 py-3 text-center pt-4">
                      <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2.5 py-1 rounded-lg">
                        {p.rata_rata}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center pt-4">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => handleEdit(p)} className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg font-bold">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold">Hapus</button>
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