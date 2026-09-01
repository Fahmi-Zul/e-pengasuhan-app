'use client';

import { useState, useEffect, useRef } from 'react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    id: 1,
    nama_instansi: "",
    alamat: "",
    kontak: "",
    logo_url: "",
    pejabat_1_nama: "",
    pejabat_1_jabatan: "",
    pejabat_2_nama: "",
    pejabat_2_jabatan: "",
    pejabat_3_nama: "",
    pejabat_3_jabatan: "",
    ttd_1_url: "",
    ttd_2_url: "",
    cap_url: ""
  });

  const [usersList, setUsersList] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ id: null, username: "", password: "", nama_lengkap: "", role: "Musyrif" });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordIds, setShowPasswordIds] = useState<{ [key: number]: boolean }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: "", type: "" });

  // Referensi untuk mengosongkan nilai input file secara fisik
  const logoInputRef = useRef<HTMLInputElement>(null);
  const ttd1InputRef = useRef<HTMLInputElement>(null);
  const ttd2InputRef = useRef<HTMLInputElement>(null);
  const capInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsersList(data.data);
    } catch (error) {
      console.error("Gagal mengambil data user", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil pengaturan", error);
    }
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPasswordIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserChange = (e: any) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: any, fieldName: string) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        window.alert("Ukuran file terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [fieldName]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi untuk menghapus gambar sekaligus mereset input file terkait
  const handleRemoveImage = (fieldName: string, inputRef: any) => {
    setFormData({ ...formData, [fieldName]: "" });
    if (inputRef && inputRef.current) {
      inputRef.current.value = ""; // Mengosongkan nama file yang menyangkut di input
    }
  };

  const handleSaveSettings = async (e: any) => {
    e.preventDefault();
    setIsSaving(true);
    setAlertInfo({ show: false, message: "", type: "" });
    
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setAlertInfo({ show: true, message: "Pengaturan & berkas berhasil disimpan!", type: "success" });
        window.dispatchEvent(new Event('settingsUpdated'));
        setTimeout(() => setAlertInfo({ show: false, message: "", type: "" }), 3000);
      } else {
        setAlertInfo({ show: true, message: "Gagal menyimpan: " + data.error, type: "error" });
      }
    } catch (error) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan jaringan.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUser = async (e: any) => {
    e.preventDefault();
    try {
      const url = '/api/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        setNewUser({ id: null, username: "", password: "", nama_lengkap: "", role: "Musyrif" });
        setIsEditing(false);
        fetchUsers();
        alert(isEditing ? "Akun berhasil diperbarui!" : "Akun berhasil ditambahkan!");
      } else {
        alert("Gagal memproses akun: " + data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleEditUser = (user: any) => {
    setIsEditing(true);
    setNewUser({
      id: user.id,
      username: user.username,
      password: user.password || "",
      nama_lengkap: user.nama_lengkap,
      role: user.role
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUser({ id: null, username: "", password: "", nama_lengkap: "", role: "Musyrif" });
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("Yakin ingin menghapus akun ini?")) {
      try {
        const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          fetchUsers();
        } else {
          alert("Gagal menghapus: " + data.error);
        }
      } catch (err) {
        alert("Terjadi kesalahan jaringan.");
      }
    }
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem & Kontrol Akses</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola identitas instansi, tanda tangan laporan, serta hak akses akun pengguna aplikasi.</p>
      </div>

      {alertInfo.show && (
        <div className={`p-4 mb-6 text-sm font-semibold rounded-lg border flex items-center gap-2 ${
          alertInfo.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {alertInfo.message}
        </div>
      )}

      {/* Form Pengaturan Instansi & Berkas */}
      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-5xl">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
            <h2 className="text-lg font-bold text-slate-700">Profil & Identitas Instansi</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Instansi Sekolah</label>
              <input type="text" name="nama_instansi" value={formData.nama_instansi} onChange={handleChange} placeholder="Masukkan nama instansi..." className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Alamat Lengkap</label>
              <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows={2} placeholder="Masukkan alamat lengkap..." className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Kontak (Telepon / Email)</label>
              <input type="text" name="kontak" value={formData.kontak} onChange={handleChange} placeholder="021-xxxx / info@sekolah.com" className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Upload Logo Instansi</label>
              <div className="flex items-center gap-4">
                {formData.logo_url && (
                  <div className="relative inline-block">
                    <img src={formData.logo_url} alt="Logo" className="w-12 h-12 object-contain border rounded-lg bg-slate-50 p-1" />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage('logo_url', logoInputRef)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-700 transition"
                      title="Batalkan / Hapus Gambar"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input 
                  ref={logoInputRef}
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={(e) => handleImageUpload(e, 'logo_url')} 
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-300 rounded-lg" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tanda Tangan Pejabat & Cap Instansi */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">2</div>
            <h2 className="text-lg font-bold text-slate-700">Tanda Tangan Pejabat & Cap (Kop Laporan)</h2>
          </div>
          
          <div className="space-y-5">
            {/* Pejabat 1 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Jabatan 1</label>
                  <input type="text" name="pejabat_1_jabatan" value={formData.pejabat_1_jabatan} onChange={handleChange} placeholder="Kepala Sekolah" className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white font-semibold text-slate-700 outline-none" />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nama Pejabat 1</label>
                  <input type="text" name="pejabat_1_nama" value={formData.pejabat_1_nama} onChange={handleChange} placeholder="Contoh: Ust. Ahmad, S.Pd" className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Upload Gambar Tanda Tangan Pejabat 1</label>
                <div className="flex items-center gap-4">
                  {formData.ttd_1_url && (
                    <div className="relative inline-block">
                      <img src={formData.ttd_1_url} alt="TTD 1" className="w-20 h-10 object-contain border rounded bg-white p-1" />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage('ttd_1_url', ttd1InputRef)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-700 transition"
                        title="Batalkan / Hapus Gambar"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input 
                    ref={ttd1InputRef}
                    type="file" 
                    accept="image/png, image/jpeg" 
                    onChange={(e) => handleImageUpload(e, 'ttd_1_url')} 
                    className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 cursor-pointer border border-slate-300 rounded-lg" 
                  />
                </div>
              </div>
            </div>

            {/* Pejabat 2 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Jabatan 2</label>
                  <input type="text" name="pejabat_2_jabatan" value={formData.pejabat_2_jabatan} onChange={handleChange} placeholder="Waka Kesiswaan" className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white font-semibold text-slate-700 outline-none" />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nama Pejabat 2</label>
                  <input type="text" name="pejabat_2_nama" value={formData.pejabat_2_nama} onChange={handleChange} placeholder="Contoh: Ust. Budi, M.Pd" className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Upload Gambar Tanda Tangan Pejabat 2</label>
                <div className="flex items-center gap-4">
                  {formData.ttd_2_url && (
                    <div className="relative inline-block">
                      <img src={formData.ttd_2_url} alt="TTD 2" className="w-20 h-10 object-contain border rounded bg-white p-1" />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage('ttd_2_url', ttd2InputRef)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-700 transition"
                        title="Batalkan / Hapus Gambar"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input 
                    ref={ttd2InputRef}
                    type="file" 
                    accept="image/png, image/jpeg" 
                    onChange={(e) => handleImageUpload(e, 'ttd_2_url')} 
                    className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 cursor-pointer border border-slate-300 rounded-lg" 
                  />
                </div>
              </div>
            </div>

            {/* Cap Instansi */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Upload Gambar Cap / Stempel Instansi</label>
                <div className="flex items-center gap-4">
                  {formData.cap_url && (
                    <div className="relative inline-block">
                      <img src={formData.cap_url} alt="Cap" className="w-12 h-12 object-contain border rounded-full bg-white p-1" />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage('cap_url', capInputRef)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-700 transition"
                        title="Batalkan / Hapus Gambar"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input 
                    ref={capInputRef}
                    type="file" 
                    accept="image/png, image/jpeg" 
                    onChange={(e) => handleImageUpload(e, 'cap_url')} 
                    className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700 cursor-pointer border border-slate-300 rounded-lg" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving ? 'Menyimpan Berkas...' : 'Simpan Konfigurasi & Berkas Instansi'}
          </button>
        </div>
      </form>

      {/* Bagian Manajemen Akun Pengguna (Manajemen Users) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-5xl mt-10">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">3</div>
            <h2 className="text-lg font-bold text-slate-700">Manajemen Akun & Hak Akses (Roles)</h2>
          </div>
          {isEditing && (
            <button onClick={handleCancelEdit} className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition">
              Batal Edit
            </button>
          )}
        </div>

        {/* Form Tambah / Edit User */}
        <form onSubmit={handleSaveUser} className={`grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 rounded-xl border ${isEditing ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Nama Lengkap</label>
            <input type="text" name="nama_lengkap" value={newUser.nama_lengkap} onChange={handleUserChange} placeholder="Nama & Gelar" className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white outline-none" required />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Username</label>
            <input type="text" name="username" value={newUser.username} onChange={handleUserChange} placeholder="Username login" className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white outline-none" required />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
              Password {isEditing && <span className="text-[9px] text-amber-600 font-normal">(Kosongkan jika tdk diubah)</span>}
            </label>
            <input type="text" name="password" value={newUser.password} onChange={handleUserChange} placeholder={isEditing ? "Tetap password lama" : "Password"} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white outline-none" {...(!isEditing ? { required: true } : {})} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Role / Akses</label>
            <select name="role" value={newUser.role} onChange={handleUserChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white outline-none font-semibold">
              <option value="Admin">Admin</option>
              <option value="Waka">Waka</option>
              <option value="Musyrif">Musyrif</option>
              <option value="Guru">Guru</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className={`w-full font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-sm ${isEditing ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
              {isEditing ? '💾 Simpan' : '+ Tambah Akun'}
            </button>
          </div>
        </form>

        {/* Tabel Daftar Akun */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b">
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">Username</th>
                <th className="p-3">Password</th>
                <th className="p-3">Role / Akses</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.length > 0 ? (
                usersList.map((user) => {
                  const isVisible = showPasswordIds[user.id];
                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">{user.nama_lengkap}</td>
                      <td className="p-3 text-slate-600">{user.username}</td>
                      <td className="p-3 font-mono text-slate-600 bg-slate-50">
                        <div className="flex items-center justify-between gap-2">
                          <span>{isVisible ? user.password : "••••••••"}</span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-slate-400 hover:text-slate-700 transition p-1"
                            title={isVisible ? "Sembunyikan Password" : "Tampilkan Password"}
                          >
                            {isVisible ? "👁️‍🗨️" : "👁️"}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'Waka' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'Musyrif' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-2">
                        <button onClick={() => handleEditUser(user)} className="bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold px-3 py-1.5 rounded-lg transition">Edit</button>
                        <button onClick={() => handleDeleteUser(user.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg transition">Hapus</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-slate-400">Belum ada data akun terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}