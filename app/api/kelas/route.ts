import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        k.id, 
        k.tingkat, 
        k.nama_kelas, 
        k.wali_kelas_id, 
        COALESCE(g.nama_guru, '-') AS nama_wali_kelas
      FROM data_kelas k
      LEFT JOIN data_guru g ON k.wali_kelas_id = g.id
      ORDER BY k.tingkat ASC, k.nama_kelas ASC;
    `;
    const res = await pool.query(query);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nama_kelas, wali_kelas_id } = await req.json();

    if (!nama_kelas || nama_kelas.trim() === '') {
      return NextResponse.json({ success: false, error: 'Nama kelas wajib diisi' }, { status: 400 });
    }

    const cleanNama = nama_kelas.trim();
    const tingkatMatch = cleanNama.match(/\d+/);
    const tingkatVal = tingkatMatch ? parseInt(tingkatMatch[0], 10) : 10;

    const query = `
      INSERT INTO data_kelas (nama_kelas, tingkat, wali_kelas_id)
      VALUES ($1, $2, $3) RETURNING *;
    `;
    const res = await pool.query(query, [cleanNama, tingkatVal, wali_kelas_id || null]);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, nama_kelas, wali_kelas_id } = await req.json();
    const cleanNama = nama_kelas.trim();
    const tingkatMatch = cleanNama.match(/\d+/);
    const tingkatVal = tingkatMatch ? parseInt(tingkatMatch[0], 10) : 10;

    const query = `
      UPDATE data_kelas 
      SET nama_kelas = $1, tingkat = $2, wali_kelas_id = $3 
      WHERE id = $4 RETURNING *;
    `;
    const res = await pool.query(query, [cleanNama, tingkatVal, wali_kelas_id || null, id]);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await pool.query('DELETE FROM data_kelas WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus kelas' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}