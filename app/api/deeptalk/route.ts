import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    // Coba query dengan JOIN ke data_santri
    const query = `
      SELECT 
        dt.id,
        TO_CHAR(dt.tanggal, 'YYYY-MM-DD') AS tanggal,
        dt.jam,
        dt.santri_id,
        COALESCE(dt.kelas, '-') AS kelas,
        COALESCE(dt.kategori_topik, '-') AS kategori_topik,
        COALESCE(dt.catatan_deeptalk, '') AS catatan_deeptalk,
        COALESCE(dt.tindak_lanjut, '') AS tindak_lanjut,
        COALESCE(s.nama_santri, 'Santri ID: ' || dt.santri_id) AS nama_santri
      FROM data_deeptalk dt
      LEFT JOIN data_santri s ON dt.santri_id = s.id
      ORDER BY dt.id DESC;
    `;
    const res = await pool.query(query);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    console.error("API GET ERROR:", error.message);
    // Fallback darurat: Jika query di atas gagal, ambil data murni dari tabel data_deeptalk saja agar tidak error 500
    try {
      const fallback = await pool.query('SELECT * FROM data_deeptalk ORDER BY id DESC;');
      const safeData = fallback.rows.map(row => ({
        ...row,
        nama_santri: `Santri (ID: ${row.santri_id})`,
        kelas: row.kelas || '-'
      }));
      return NextResponse.json({ success: true, data: safeData });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tanggal, jam, santri_id, kelas, kategori_topik, catatan_deeptalk, tindak_lanjut } = body;

    const query = `
      INSERT INTO data_deeptalk (tanggal, jam, santri_id, kelas, kategori_topik, catatan_deeptalk, tindak_lanjut)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;
    
    const res = await pool.query(query, [
      tanggal || new Date().toISOString().split('T')[0],
      jam || '08:00',
      parseInt(santri_id, 10),
      kelas || '-',
      kategori_topik || 'Lainnya',
      catatan_deeptalk || '-',
      tindak_lanjut || null,
    ]);

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    console.error("API POST ERROR:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, tanggal, jam, santri_id, kelas, kategori_topik, catatan_deeptalk, tindak_lanjut } = await req.json();

    const query = `
      UPDATE data_deeptalk 
      SET tanggal = $1, jam = $2, santri_id = $3, kelas = $4, kategori_topik = $5, catatan_deeptalk = $6, tindak_lanjut = $7
      WHERE id = $8 RETURNING *;
    `;
    const res = await pool.query(query, [
      tanggal,
      jam,
      parseInt(santri_id, 10),
      kelas || '-',
      kategori_topik,
      catatan_deeptalk,
      tindak_lanjut || null,
      parseInt(id, 10),
    ]);

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    console.error("API PUT ERROR:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await pool.query('DELETE FROM data_deeptalk WHERE id = $1', [parseInt(id, 10)]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus data' });
  } catch (error: any) {
    console.error("API DELETE ERROR:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}