import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const cleanUsername = username ? username.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';

    console.log(`Mencoba login untuk username: "${cleanUsername}"`);

    // Query pencarian dengan mengabaikan perbedaan huruf besar/kecil pada username
    const res = await pool.query(
      "SELECT id, username, password, nama_lengkap, role FROM users WHERE LOWER(TRIM(username)) = $1 AND password = $2", 
      [cleanUsername, cleanPassword]
    );

    if (res.rows.length === 0) {
      console.log("Login gagal: User tidak ditemukan atau password salah.");
      return NextResponse.json({ 
        success: false, 
        message: "Username atau password salah." 
      }, { status: 401 });
    }

    const user = res.rows[0];
    console.log(`Login berhasil untuk: ${user.username} dengan role: ${user.role}`);

    return NextResponse.json({ 
      success: true, 
      message: "Login berhasil",
      user: { 
        id: user.id, 
        nama: user.nama_lengkap || user.username, 
        role: user.role || 'Admin' 
      }
    });

  } catch (error: any) {
    console.error("Error pada server login:", error.message);
    return NextResponse.json({ 
      success: false, 
      message: "Server error: " + error.message 
    }, { status: 500 });
  }
}