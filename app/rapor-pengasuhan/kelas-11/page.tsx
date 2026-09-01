'use client';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

const BOBOT: Record<string, number> = {
  sholat_fardhu: 5, qiyamullail: 2, sholat_dhuha: 1, sholat_rawatib: 2, puasa_sunnah: 1, dzikir_doa: 1, infaq: 1,
  akhlaq_guru: 2, akhlaq_sesama: 2, senyum_sapa_salam: 1, sabar_lisan: 2, pakaian_islami: 2, kebersihan_kerapihan: 2,
  kepemimpinan: 2, kemandirian: 2, pidato: 1, bhs_arab: 1, bhs_inggris: 1,
  kedisiplinan: 2, kesehatan: 1, tarbiyah_kps: 1,
  dzikir_matsurat: 10, dzikir_bada_shalat: 5
};

const getNilai = (huruf: string) => {
  const map: Record<string, { angka: number, ket: string }> = {
    'A': { angka: 4, ket: 'Sangat Baik' }, 'B': { angka: 3, ket: 'Baik' }, 'C': { angka: 2, ket: 'Cukup' }, 'D': { angka: 1, ket: 'Kurang' }
  };
  return map[huruf?.toUpperCase()] || { angka: 0, ket: '-' };
};

const DEFAULT_FORM = {
  santri_id: '', kelas: '', asrama: 'Arofah', kamar: '1', semester: 'Genap', tahun_ajaran: '2024-2025',
  sholat_fardhu: 'A', qiyamullail: 'A', sholat_dhuha: 'A', sholat_rawatib: 'A', puasa_sunnah: 'A', dzikir_doa: 'A', infaq: 'A',
  akhlaq_guru: 'A', akhlaq_sesama: 'A', senyum_sapa_salam: 'A', sabar_lisan: 'A', pakaian_islami: 'A', kebersihan_kerapihan: 'A',
  kepemimpinan: 'A', kemandirian: 'A', pidato: 'A', bhs_arab: 'A', bhs_inggris: 'A',
  kedisiplinan: 'A', kesehatan: 'A', tarbiyah_kps: 'A', dzikir_matsurat: 'A', dzikir_bada_shalat: 'A',
  catatan_ibadah: '', catatan_akhlaq: '', catatan_keterampilan: '', catatan_kedisiplinan: '', catatan_kps: '', catatan_ujian: ''
};

export default function RaporKelas11Page() {
  const tingkatKelas = '11';
  const [dataList, setDataList] = useState<any[]>([]);
  const [allSantri, setAllSantri] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  
  const [searchNama, setSearchNama] = useState('');
  const [selectedSubKelas, setSelectedSubKelas] = useState('');
  const [printData, setPrintData] = useState<any>(null);

  const [settings, setSettings] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRapor, resSantri, resSettings] = await Promise.all([
        fetch('/api/rapor').then(r => r.json()),
        fetch('/api/santri').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);
      if (resRapor.success) setDataList(resRapor.data);
      if (resSantri.success) setAllSantri(resSantri.data);
      if (resSettings.success && resSettings.data) setSettings(resSettings.data);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const santriTingkatIni = allSantri.filter(s => {
    const k = String(s.kelas || '').trim();
    return k.includes(tingkatKelas) || k.startsWith(tingkatKelas);
  });
  const subKelasUnik = Array.from(new Set(santriTingkatIni.map(s => s.kelas).filter(Boolean)));

  const handleChange = (e: any) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.santri_id) return alert('Pilih Santri Terlebih Dahulu!');
    const selectedSntr = allSantri.find(s => String(s.id) === String(formData.santri_id));
    const finalData = { ...formData, kelas: selectedSntr?.kelas || '-' };

    const res = await fetch('/api/rapor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData),
    });
    const result = await res.json();
    if (result.success) { 
      alert(`Data Rapor Kelas ${tingkatKelas} Berhasil Disimpan!`); 
      setFormData(DEFAULT_FORM); 
      loadData(); 
    } else {
      alert('Gagal menyimpan: ' + result.error);
    }
  };

  const handlePrint = (item: any) => {
    setPrintData(item);
    setTimeout(() => { window.print(); }, 400);
  };

  const handleDownloadPDF = async (item: any) => {
    setPrintData(item);
    
    setTimeout(async () => {
      const printElement = document.getElementById('print-area');
      if (!printElement) return;

      printElement.classList.remove('hidden');
      printElement.style.position = 'absolute';
      printElement.style.top = '-9999px';
      printElement.style.left = '-9999px';
      printElement.style.width = '794px';

      try {
        const canvas = await html2canvas(printElement, { 
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          logging: false 
        });
        
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        
        let pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        if (pdfHeight > pdfPageHeight) {
          pdfHeight = pdfPageHeight - 4;
        }

        pdf.addImage(imgData, 'PNG', 0, 2, pdfWidth, pdfHeight);
        pdf.save(`Rapor_${item.nama_santri}_Kelas_${tingkatKelas}.pdf`);
      } catch (err) {
        console.error("Gagal merender PDF:", err);
        alert("Gagal mengunduh PDF.");
      } finally {
        printElement.classList.add('hidden');
        printElement.style.position = '';
        printElement.style.top = '';
        printElement.style.left = '';
        printElement.style.width = '';
      }
    }, 1000);
  };

  const hapusData = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data rapor ini?')) return;
    try {
      const res = await fetch('/api/rapor', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id }) 
      });
      const result = await res.json();
      if (result.success) {
        loadData();
      } else {
        alert('Gagal menghapus data: ' + result.error);
      }
    } catch (err) {
      console.error('Error hapus:', err);
    }
  };
  
  const filteredRapor = dataList.filter(item => {
    const matchTingkat = String(item.kelas || '').trim().includes(tingkatKelas);
    const matchNama = item.nama_santri?.toLowerCase().includes(searchNama.toLowerCase());
    const matchSub = selectedSubKelas ? item.kelas === selectedSubKelas : true;
    return matchTingkat && matchNama && matchSub;
  });

  const renderPrintRow = (title: string, key: string, isHeader = false) => {
    if (isHeader) return <tr className="bg-slate-200 font-bold"><td colSpan={2} className="border border-black p-1">{title}</td><td className="border border-black text-center">{BOBOT[key]}</td><td colSpan={4} className="border border-black"></td></tr>;
    const huruf = printData?.[key] || 'A';
    const { angka, ket } = getNilai(huruf);
    const skor = angka * (BOBOT[key] || 1);
    return (
      <tr>
        <td colSpan={2} className="border border-black p-1">{title}</td>
        <td className="border border-black text-center">{BOBOT[key]}</td>
        <td className="border border-black text-center font-bold">{huruf}</td>
        <td className="border border-black text-center">{angka}</td>
        <td className="border border-black text-center">{skor}</td>
        <td className="border border-black p-1">{ket}</td>
      </tr>
    );
  };

  return (
    <main className="min-h-screen text-slate-800 bg-[#f4f7fc]">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 10mm 6mm 10mm;
          }
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-size: 9.5px !important;
          }
        }
      `}} />

      <div className="p-6 print:hidden">
        <div className="bg-white p-5 rounded-3xl shadow-sm mb-6 flex flex-col gap-3 border border-slate-100">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-slate-800 uppercase">Manajemen Rapor Pengasuhan — Kelas {tingkatKelas}</h1>
            <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-extrabold border border-indigo-200">Kelas {tingkatKelas}</span>
          </div>
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-950">
            <h3 className="font-extrabold mb-2 uppercase text-indigo-700 text-sm">📢 Tata Cara Pengisian Rapor Kelas {tingkatKelas}</h3>
            <ol className="list-decimal list-inside space-y-1.5 font-medium">
              <li>Pilih nama santri khusus dari kelas {tingkatKelas}.</li>
              <li>Isi Nama Asrama dan Nomor Kamar pada kolom input yang terpisah.</li>
              <li>Pilih Semester dan input rekapan nilai huruf <b>"A / B / C / D"</b>.</li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-slate-200 p-5 h-fit">
            <h2 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">📋 Form Input Ledger</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <div className="col-span-2">
                  <label className="font-bold block mb-1 text-slate-600">Pilih Santri (Total: {santriTingkatIni.length} Santri):</label>
                  <select required name="santri_id" value={formData.santri_id} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500">
                    <option value="">-- Pilih Nama Santri --</option>
                    {santriTingkatIni.map(s => <option key={s.id} value={s.id}>{s.nama_santri} ({s.kelas})</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-600">Nama Asrama:</label>
                  <input type="text" name="asrama" value={formData.asrama} onChange={handleChange} placeholder="Contoh: Arofah" className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-600">Nomor Kamar:</label>
                  <input type="text" name="kamar" value={formData.kamar} onChange={handleChange} placeholder="Contoh: 1" className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-600">Semester:</label>
                  <select name="semester" value={formData.semester} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500" required>
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-600">Tahun Pelajaran:</label>
                  <input type="text" name="tahun_ajaran" value={formData.tahun_ajaran} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:border-indigo-500" required />
                </div>
              </div>

              {[
                { title: 'Pengamalan Ibadah (Bobot: 13)', keys: ['sholat_fardhu', 'qiyamullail', 'sholat_dhuha', 'sholat_rawatib', 'puasa_sunnah', 'dzikir_doa', 'infaq'] },
                { title: 'Akhlaq (Bobot: 11)', keys: ['akhlaq_guru', 'akhlaq_sesama', 'senyum_sapa_salam', 'sabar_lisan', 'pakaian_islami', 'kebersihan_kerapihan'] },
                { title: 'Keterampilan & Asrama (Bobot: 7)', keys: ['kepemimpinan', 'kemandirian', 'pidato', 'bhs_arab', 'bhs_inggris', 'kedisiplinan', 'kesehatan', 'tarbiyah_kps'] },
                { title: 'Ujian Praktek (Bobot: 15)', keys: ['dzikir_matsurat', 'dzikir_bada_shalat'] }
              ].map(group => (
                <div key={group.title} className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-sm">
                  <h3 className="font-bold text-indigo-700 mb-2.5 border-b border-slate-100 pb-1.5">{group.title}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {group.keys.map(k => (
                      <div key={k} className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl border border-slate-200">
                        <span className="capitalize font-medium w-3/4 truncate pr-2 text-slate-700">{k.replace(/_/g, ' ')}</span>
                        <select name={k} value={formData[k]} onChange={handleChange} className="w-16 p-1.5 border border-slate-200 rounded-lg bg-white text-center font-bold text-indigo-600 outline-none focus:border-indigo-500 shadow-sm">
                          <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-sm flex flex-col gap-2.5">
                <h3 className="font-bold text-indigo-700 border-b border-slate-100 pb-1.5">CATATAN PERKEMBANGAN SANTRI</h3>
                {['catatan_ibadah', 'catatan_akhlaq', 'catatan_keterampilan', 'catatan_kedisiplinan', 'catatan_kps', 'catatan_ujian'].map(c => (
                  <textarea key={c} name={c} value={formData[c]} onChange={handleChange} placeholder={`Catatan ${c.replace(/_/g, ' ')}...`} className="w-full p-2.5 border border-slate-200 rounded-xl h-12 bg-slate-50/50 text-slate-700 outline-none focus:border-indigo-500 text-xs" />
                ))}
              </div>

              <button type="submit" className="w-full bg-[#4f46e5] text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md transition-all">Simpan Rapor Kelas {tingkatKelas}</button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200 p-5 flex flex-col h-fit">
             <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
               <h2 className="font-bold text-slate-700">📂 Daftar Rapor Kelas {tingkatKelas} <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-semibold ml-2">Total: {filteredRapor.length}</span></h2>
             </div>
             
             <div className="flex gap-2 mb-4 text-xs">
                <input type="text" placeholder="Cari nama santri..." value={searchNama} onChange={(e) => setSearchNama(e.target.value)} className="w-2/3 p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:border-indigo-500" />
                <select value={selectedSubKelas} onChange={(e) => setSelectedSubKelas(e.target.value)} className="w-1/3 p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 font-semibold outline-none focus:border-indigo-500">
                  <option value="">Semua Sub Kelas</option>
                  {subKelasUnik.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
             </div>
             <div className="overflow-x-auto rounded-xl border border-slate-200">
               <table className="w-full text-left text-xs">
                 <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                   <tr><th className="p-3">Nama Santri</th><th className="p-3">Kelas / Asrama & Kamar</th><th className="p-3 text-center">Aksi Printout</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {loading ? <tr><td colSpan={3} className="text-center p-6 text-slate-400">Memuat...</td></tr> :
                    filteredRapor.length === 0 ? <tr><td colSpan={3} className="text-center p-6 text-slate-400">Belum ada data rapor.</td></tr> :
                    filteredRapor.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-700">{r.nama_santri}</td>
                        <td className="p-3">{r.kelas} &nbsp;/&nbsp; {r.asrama} - Kamar {r.kamar}</td>
                        <td className="p-3 flex justify-center gap-2">
                          <button onClick={() => handlePrint(r)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all">Cetak</button>
                          <button onClick={() => handleDownloadPDF(r)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all">Unduh PDF</button>
                          <button onClick={() => hapusData(r.id)} className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-all">Hapus</button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>

      {/* AREA PRINT VIEW */}
      <div 
        id="print-area" 
        className="hidden print:block bg-white text-black text-[10px] leading-tight font-sans" 
        style={{ width: '794px', padding: '6px 16px', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
        >
        
        <div className="flex items-center justify-between border-b-4 border-double border-black pb-2 mb-3 w-full">
          <div className="w-32 flex-shrink-0">
             <img src={settings?.logo_url || "/assets/logo.png"} alt="Logo Instansi" className="w-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-[11px] font-extrabold tracking-[0.35em] text-black uppercase mb-0.5">
              YAYASAN DARUL QUR'AN MULIA
            </p>
            <h1 className="font-black text-[18px] uppercase tracking-wider text-black leading-tight mb-0.5">
              {settings?.nama_instansi || "SMA IT DARUL QUR’AN MULIA"}
            </h1>
            <p className="font-extrabold text-[12px] tracking-[0.3em] text-black uppercase mb-1">
              TERAKREDITASI “A”
            </p>
            <p className="text-[10px] font-bold tracking-wide text-black">
              {settings?.alamat || "NPSN : 70035800  |  Website : www.dqm.sch.id"} {settings?.kontak ? ` | ${settings.kontak}` : ''}
            </p>
          </div>
          <div className="w-32 flex-shrink-0 hidden sm:block"></div>
        </div>

        <h2 className="text-center text-sm font-bold uppercase mb-4 tracking-widest">Rapor Kesantrian SMA IT Putra</h2>
        
        <table className="w-full mb-3 text-[10px]" style={{ border: 'none' }}>
          <tbody>
            <tr>
              <td className="w-40 font-bold py-1 px-1">Nama Santri</td>
              <td className="w-4 py-1 px-1 text-center font-bold">:</td>
              <td className="py-1 px-1"><span className="font-bold">{printData?.nama_santri}</span></td>
            </tr>
            <tr>
              <td className="font-bold py-1 px-1">Kelas / Kamar</td>
              <td className="py-1 px-1 text-center font-bold">:</td>
              <td className="py-1 px-1">{printData?.kelas} &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp; {printData?.asrama} - Kamar {printData?.kamar}</td>
            </tr>
            <tr>
              <td className="font-bold py-1 px-1">Semester / Tahun Pelajaran</td>
              <td className="py-1 px-1 text-center font-bold">:</td>
              <td className="py-1 px-1">{printData?.semester} / {printData?.tahun_ajaran}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mb-3 text-[10px]" style={{ border: '1px solid black' }}>
          <thead className="bg-gray-100 font-bold text-center">
            <tr>
              <th className="p-1 w-8" style={{ border: '1px solid black' }} rowSpan={2}>No.</th>
              <th className="p-1" style={{ border: '1px solid black' }} rowSpan={2}>Aspek Penilaian</th>
              <th className="p-1 w-12" style={{ border: '1px solid black' }} rowSpan={2}>Bobot</th>
              <th className="p-1" style={{ border: '1px solid black' }} colSpan={3}>Nilai</th>
              <th className="p-1 w-32" style={{ border: '1px solid black' }} rowSpan={2}>Keterangan</th>
            </tr>
            <tr>
              <th className="p-1 w-10" style={{ border: '1px solid black' }}>Huruf</th>
              <th className="p-1 w-10" style={{ border: '1px solid black' }}>Angka</th>
              <th className="p-1 w-10" style={{ border: '1px solid black' }}>Skor</th>
            </tr>
          </thead>
          <tbody>
            {renderPrintRow('Pengamalan Ibadah', 'ibadah_header', true)}
            {renderPrintRow('1. Sholat Fardhu Berjamaah di Masjid', 'sholat_fardhu')}
            {renderPrintRow('2. Qiyamullail & Witir', 'qiyamullail')}
            {renderPrintRow('3. Sholat Dhuha', 'sholat_dhuha')}
            {renderPrintRow('4. Sholat Rawatib', 'sholat_rawatib')}
            {renderPrintRow('5. Puasa Sunnah', 'puasa_sunnah')}
            {renderPrintRow('6. Dzikir & Do\'a', 'dzikir_doa')}
            {renderPrintRow('7. Infaq', 'infaq')}
            {renderPrintRow('Akhlaq', 'akhlaq_header', true)}
            {renderPrintRow('8. Akhlaq terhadap Guru', 'akhlaq_guru')}
            {renderPrintRow('9. Akhlaq terhadap Sesama dan Lingkungan', 'akhlaq_sesama')}
            {renderPrintRow('10. Senyum, Sapa, Salam', 'senyum_sapa_salam')}
            {renderPrintRow('11. Sabar dalam Menjaga lisan', 'sabar_lisan')}
            {renderPrintRow('12. Pakaian dan Penampilan', 'pakaian_islami')}
            {renderPrintRow('13. Kebersihan & Kerapihan', 'kebersihan_kerapihan')}
            {renderPrintRow('Keterampilan', 'keterampilan_header', true)}
            {renderPrintRow('14. Kepemimpinan', 'kepemimpinan')}
            {renderPrintRow('15. Kemandirian', 'kemandirian')}
            {renderPrintRow('16. Pidato', 'pidato')}
            {renderPrintRow('17. Kosa Kata dan Percakapan Bahasa Arab', 'bhs_arab')}
            {renderPrintRow('18. Kosa Kata dan Percakapan Bahasa Inggris', 'bhs_inggris')}
            {renderPrintRow('19. Kedisiplinan Keasramaan', 'kedisiplinan')}
            {renderPrintRow('20. Kesehatan', 'kesehatan')}
            {renderPrintRow('21. KPS (Kelompok Pembinaan Santri)', 'tarbiyah_kps')}
            {renderPrintRow('Ujian Praktek', 'ujian_header', true)}
            {renderPrintRow('22. Dzikir Al Matsurat', 'dzikir_matsurat')}
            {renderPrintRow('23. Dzikir Ba\'da Shalat Wajib', 'dzikir_bada_shalat')}
            
            <tr className="font-bold bg-gray-50 text-center">
              <td colSpan={2} className="p-1 text-right pr-4" style={{ border: '1px solid black' }}>TOTAL</td>
              <td className="p-1" style={{ border: '1px solid black' }}>50</td>
              <td colSpan={2} className="bg-gray-200" style={{ border: '1px solid black' }}></td>
              <td className="bg-gray-200 p-1" style={{ border: '1px solid black' }}>{printData ? Object.keys(BOBOT).reduce((acc, k) => acc + (getNilai(printData[k]).angka * BOBOT[k]), 0) : '-'}</td>
              <td className="bg-gray-200" style={{ border: '1px solid black' }}></td>
            </tr>

            <tr className="font-bold text-center">
              <td colSpan={5} className="p-1 text-right pr-4 uppercase" style={{ border: '1px solid black' }}>Indeks Prestasi Komulatif (IPK)</td>
              <td colSpan={2} className="p-1 text-left pl-4 font-black" style={{ border: '1px solid black' }}>
                {printData ? ((Object.keys(BOBOT).reduce((acc, k) => acc + (getNilai(printData[k]).angka * BOBOT[k]), 0)) / 50).toFixed(2) : '-'}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mb-2 text-[10px]" style={{ border: '1px solid black' }}>
          <thead>
            <tr className="bg-gray-100">
              <th colSpan={3} className="p-1 text-left font-bold" style={{ border: '1px solid black' }}>Catatan Perkembangan Santri</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="w-1/4 p-1 pl-2 font-semibold" style={{ border: '1px solid black', borderRight: 'none' }}>Pengalaman Ibadah</td>
              <td className="w-6 p-1 text-center font-bold" style={{ border: '1px solid black', borderLeft: 'none', borderRight: 'none' }}>:</td>
              <td className="w-auto p-1 italic" style={{ border: '1px solid black', borderLeft: 'none' }}>{printData?.catatan_ibadah || '-'}</td>
            </tr>
            <tr>
              <td className="p-1 pl-2 font-semibold" style={{ border: '1px solid black', borderRight: 'none' }}>Akhlak</td>
              <td className="p-1 text-center font-bold" style={{ border: '1px solid black', borderLeft: 'none', borderRight: 'none' }}>:</td>
              <td className="p-1 italic" style={{ border: '1px solid black', borderLeft: 'none' }}>{printData?.catatan_akhlaq || '-'}</td>
            </tr>
            <tr>
              <td className="p-1 pl-2 font-semibold" style={{ border: '1px solid black', borderRight: 'none' }}>Keterampilan</td>
              <td className="p-1 text-center font-bold" style={{ border: '1px solid black', borderLeft: 'none', borderRight: 'none' }}>:</td>
              <td className="p-1 italic" style={{ border: '1px solid black', borderLeft: 'none' }}>{printData?.catatan_keterampilan || '-'}</td>
            </tr>
            <tr>
              <td className="p-1 pl-2 font-semibold" style={{ border: '1px solid black', borderRight: 'none' }}>Kedisiplinan Keasramaan</td>
              <td className="p-1 text-center font-bold" style={{ border: '1px solid black', borderLeft: 'none', borderRight: 'none' }}>:</td>
              <td className="p-1 italic" style={{ border: '1px solid black', borderLeft: 'none' }}>{printData?.catatan_kedisiplinan || '-'}</td>
            </tr>
            <tr>
              <td className="p-1 pl-2 font-semibold" style={{ border: '1px solid black', borderRight: 'none' }}>KPS</td>
              <td className="p-1 text-center font-bold" style={{ border: '1px solid black', borderLeft: 'none', borderRight: 'none' }}>:</td>
              <td className="p-1 italic" style={{ border: '1px solid black', borderLeft: 'none' }}>{printData?.catatan_kps || '-'}</td>
            </tr>
            <tr>
              <td className="p-1 pl-2 font-semibold" style={{ border: '1px solid black', borderRight: 'none' }}>Ujian Praktek</td>
              <td className="p-1 text-center font-bold" style={{ border: '1px solid black', borderLeft: 'none', borderRight: 'none' }}>:</td>
              <td className="p-1 italic" style={{ border: '1px solid black', borderLeft: 'none' }}>{printData?.catatan_ujian || '-'}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-[10px] mb-2 px-1 font-medium text-black">
          Ditetapkan di Bogor, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
  
        {/* TANDA TANGAN & CAP DENGAN UKURAN PROPOSIONAL KEMBALI */}
        <div className="flex justify-between px-10 text-[11px] text-center font-bold pb-10">
          <div>
            <p className="mt-1 uppercase">{settings?.pejabat_1_jabatan || "Kepala Unit SMA"}</p>
            <div className="h-20 relative flex items-center justify-center">
               {/* Cap Instansi Besar */}
               {settings?.cap_url && (
                 <img src={settings.cap_url} className="absolute h-30 -ml-8 opacity-70 pointer-events-none" alt="Cap" onError={(e) => e.currentTarget.style.display = 'none'} />
               )}
               {/* TTD Pejabat 1 Besar */}
               {settings?.ttd_1_url && (
                 <img src={settings.ttd_1_url} className="absolute h-22 z-10 pointer-events-none" alt="TTD 1" onError={(e) => e.currentTarget.style.display = 'none'} />
               )}
            </div>
            <p className="border-b border-black relative z-20 inline-block px-2">{settings?.pejabat_1_nama || "Ust. Ahmad Abdul Rozak, Lc"}</p>
          </div>
          <div>
            <p className="mt-1 uppercase">{settings?.pejabat_2_jabatan || "MUSYRIF KAMAR"}</p>
            <div className="h-20 relative flex items-center justify-center">
               {/* TTD Pejabat 2 Besar */}
               {settings?.ttd_2_url && (
                 <img src={settings.ttd_2_url} className="absolute h-40 z-10 pointer-events-none" alt="TTD 2" onError={(e) => e.currentTarget.style.display = 'none'} />
               )}
            </div>
            <p className="border-b border-black relative z-20 inline-block px-2">{settings?.pejabat_2_nama || "Ust. Septra Yodi, M.Pd"}</p>
          </div>
        </div>
      </div>
    </main>
  );
}