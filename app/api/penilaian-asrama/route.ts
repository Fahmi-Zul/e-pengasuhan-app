import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// GET: Mengambil data (dapat difilter berdasarkan tipe 'KAMAR' atau 'SANTRI')
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tipe = searchParams.get('tipe'); // 'KAMAR' atau 'SANTRI'

    let query = `
      SELECT 
        pa.id,
        pa.tipe_penilaian,
        pa.asrama,
        pa.nama_kamar,
        pa.santri_id,
        COALESCE(s.nama_santri, '-') AS nama_santri,
        pa.musyrif_id,
        COALESCE(m.nama_musyrif, '-') AS nama_musyrif,
        TO_CHAR(pa.tanggal, 'YYYY-MM-DD') AS tanggal,
        pa.aspek_1,
        pa.aspek_2,
        pa.aspek_3,
        pa.aspek_4,
        pa.aspek_5,
        pa.aspek_6,
        ROUND((pa.aspek_1 + pa.aspek_2 + pa.aspek_3 + pa.aspek_4 + pa.aspek_5 + pa.aspek_6) / 6.0, 2) AS rata_rata,
        pa.catatan
      FROM data_penilaian_asrama pa
      LEFT JOIN data_santri s ON pa.santri_id = s.id
      LEFT JOIN data_musyrif m ON pa.musyrif_id = m.id
    `;

    const params: any[] = [];
    if (tipe) {
      query += ` WHERE pa.tipe_penilaian = $1`;
      params.push(tipe);
    }

    query += ` ORDER BY pa.tanggal DESC, pa.id DESC;`;

    const res = await pool.query(query, params);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Menambah data baru
export async function POST(req: Request) {
  try {
    const {
      tipe_penilaian,
      asrama,
      nama_kamar,
      santri_id,
      musyrif_id,
      tanggal,
      aspek_1,
      aspek_2,
      aspek_3,
      aspek_4,
      aspek_5,
      aspek_6,
      catatan,
    } = await req.json();

    const query = `
      INSERT INTO data_penilaian_asrama 
      (tipe_penilaian, asrama, nama_kamar, santri_id, musyrif_id, tanggal, aspek_1, aspek_2, aspek_3, aspek_4, aspek_5, aspek_6, catatan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *;
    `;

    const res = await pool.query(query, [
      tipe_penilaian,
      asrama,
      nama_kamar || null,
      santri_id ? parseInt(santri_id, 10) : null,
      musyrif_id ? parseInt(musyrif_id, 10) : null,
      tanggal || new Date().toISOString().split('T')[0],
      aspek_1 ?? 4,
      aspek_2 ?? 4,
      aspek_3 ?? 4,
      aspek_4 ?? 4,
      aspek_5 ?? 4,
      aspek_6 ?? 4,
      catatan || '',
    ]);

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Memperbarui data
export async function PUT(req: Request) {
  try {
    const {
      id,
      asrama,
      nama_kamar,
      santri_id,
      musyrif_id,
      tanggal,
      aspek_1,
      aspek_2,
      aspek_3,
      aspek_4,
      aspek_5,
      aspek_6,
      catatan,
    } = await req.json();

    const query = `
      UPDATE data_penilaian_asrama
      SET asrama = $1, nama_kamar = $2, santri_id = $3, musyrif_id = $4, tanggal = $5, 
          aspek_1 = $6, aspek_2 = $7, aspek_3 = $8, aspek_4 = $9, aspek_5 = $10, aspek_6 = $11, catatan = $12
      WHERE id = $13 
      RETURNING *;
    `;

    const res = await pool.query(query, [
      asrama,
      nama_kamar || null,
      santri_id ? parseInt(santri_id, 10) : null,
      musyrif_id ? parseInt(musyrif_id, 10) : null,
      tanggal,
      aspek_1,
      aspek_2,
      aspek_3,
      aspek_4,
      aspek_5,
      aspek_6,
      catatan || '',
      parseInt(id, 10),
    ]);

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await pool.query('DELETE FROM data_penilaian_asrama WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus data' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}