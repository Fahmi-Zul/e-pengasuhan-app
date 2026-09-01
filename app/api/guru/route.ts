import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const query = 'SELECT * FROM data_guru ORDER BY nama_guru ASC;';
    const res = await pool.query(query);
    return NextResponse.json({ success: true, data: res.rows || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nama_guru, no_hp, jabatan_struktural, is_wali_kelas, kelas_wali } = await req.json();

    if (!nama_guru || !nama_guru.trim()) {
      return NextResponse.json({ success: false, error: 'Nama Guru wajib diisi' }, { status: 400 });
    }

    const cleanNama = nama_guru.trim();

    // Cek Duplikat Nama Guru
    const checkExist = await pool.query(
      `SELECT id FROM data_guru WHERE LOWER(TRIM(nama_guru)) = LOWER($1)`,
      [cleanNama]
    );

    if (checkExist.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: `Gagal: Nama Guru "${cleanNama}" sudah terdaftar!` },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO data_guru (nama_guru, no_hp, jabatan_struktural, is_wali_kelas, kelas_wali)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const res = await pool.query(query, [
      cleanNama,
      no_hp || '',
      jabatan_struktural || '-',
      is_wali_kelas || false,
      is_wali_kelas ? (kelas_wali || '-') : '-',
    ]);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, nama_guru, no_hp, jabatan_struktural, is_wali_kelas, kelas_wali } = await req.json();
    const cleanNama = nama_guru.trim();

    const checkExist = await pool.query(
      `SELECT id FROM data_guru WHERE LOWER(TRIM(nama_guru)) = LOWER($1) AND id != $2`,
      [cleanNama, id]
    );

    if (checkExist.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: `Gagal: Nama Guru "${cleanNama}" sudah digunakan!` },
        { status: 400 }
      );
    }

    const query = `
      UPDATE data_guru 
      SET nama_guru = $1, no_hp = $2, jabatan_struktural = $3, is_wali_kelas = $4, kelas_wali = $5 
      WHERE id = $6 RETURNING *;
    `;
    const res = await pool.query(query, [
      cleanNama,
      no_hp || '',
      jabatan_struktural || '-',
      is_wali_kelas || false,
      is_wali_kelas ? (kelas_wali || '-') : '-',
      id,
    ]);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await pool.query('DELETE FROM data_guru WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus guru' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}