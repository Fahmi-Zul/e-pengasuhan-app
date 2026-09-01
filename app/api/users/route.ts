import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET: Ambil semua daftar user beserta password-nya
export async function GET() {
  try {
    const res = await pool.query("SELECT id, username, password, nama_lengkap, role FROM users ORDER BY id ASC");
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tambah user baru
export async function POST(req: Request) {
  try {
    const { username, password, nama_lengkap, role } = await req.json();
    await pool.query(
      "INSERT INTO users (username, password, nama_lengkap, role) VALUES ($1, $2, $3, $4)",
      [username, password, nama_lengkap, role]
    );
    return NextResponse.json({ success: true, message: "Akun berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update user berdasarkan ID (bisa update data diri saja atau beserta password-nya)
export async function PUT(req: Request) {
  try {
    const { id, username, password, nama_lengkap, role } = await req.json();
    
    if (password && password.trim() !== "") {
      // Jika password diisi, update semua termasuk password baru
      await pool.query(
        "UPDATE users SET username = $1, password = $2, nama_lengkap = $3, role = $4 WHERE id = $5",
        [username, password, nama_lengkap, role, id]
      );
    } else {
      // Jika password kosong, biarkan password lama tidak berubah
      await pool.query(
        "UPDATE users SET username = $1, nama_lengkap = $2, role = $3 WHERE id = $4",
        [username, nama_lengkap, role, id]
      );
    }
    
    return NextResponse.json({ success: true, message: "Akun berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus user berdasarkan ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return NextResponse.json({ success: true, message: "Akun berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}