'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const router = useRouter();

  // Ambil data logo dan nama instansi dari pengaturan sistem
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(err => console.error("Gagal memuat pengaturan instansi", err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user_session', JSON.stringify(data.user));
        router.push('/');
      } else {
        setErrorMsg(data.message || 'Gagal masuk ke sistem.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan pada jaringan server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c2a57] flex items-center justify-center p-4 w-full">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        <div className="text-center mb-8">
          {/* Logo dinamis dari settings atau fallback ke kotak EP */}
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt="Logo Instansi" 
              className="w-14 h-14 object-contain mx-auto mb-3 bg-white rounded-xl p-1 shadow-md border border-slate-100" 
            />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-black text-lg mb-3 shadow-md">
              EP
            </div>
          )}

          <h1 className="text-xl font-bold text-slate-800 tracking-wide">
            {settings?.nama_instansi || "E-PENGASUHAN"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Sistem Pengasuhan Santri</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-2">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700" 
              placeholder="Masukkan username..."
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm transition-all text-sm mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Memproses...
              </>
            ) : (
              'Masuk ke Aplikasi'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}