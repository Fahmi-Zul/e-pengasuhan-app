import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tingkatFilter = searchParams.get('tingkat');

    let query = `
      SELECT 
        km.id, 
        COALESCE(km.tingkat, 10) AS tingkat,
        km.nama_asrama, 
        km.nomor_kamar, 
        km.kapasitas, 
        km.musyrif_id, 
        COALESCE(m.nama_musyrif, '-') AS nama_musyrif
      FROM data_kamar km
      LEFT JOIN data_musyrif m ON km.musyrif_id = m.id
    `;

    const queryParams: any[] = [];
    if (tingkatFilter && tingkatFilter !== 'all') {
      query += ` WHERE km.tingkat = $1`;
      queryParams.push(parseInt(tingkatFilter, 10));
    }

    // PENGURUTAN ANGKA ALAMI (NATURAL SORTING)
    query += `
      ORDER BY 
        km.tingkat ASC, 
        LOWER(km.nama_asrama) ASC, 
        COALESCE(NULLIF(regexp_replace(km.nomor_kamar, '[^0-9]', '', 'g'), ''), '0')::int ASC,
        LOWER(km.nomor_kamar) ASC;
    `;

    const res = await pool.query(query, queryParams);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tingkat, nama_asrama, nomor_kamar, kapasitas, musyrif_id } = await req.json();

    if (!nama_asrama || !nomor_kamar) {
      return NextResponse.json({ success: false, error: 'Nama Asrama dan Nomor Kamar wajib diisi' }, { status: 400 });
    }

    const query = `
      INSERT INTO data_kamar (tingkat, nama_asrama, nomor_kamar, kapasitas, musyrif_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const res = await pool.query(query, [
      tingkat || 10,
      nama_asrama.trim(),
      nomor_kamar.trim(),
      kapasitas || 10,
      musyrif_id || null,
    ]);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, tingkat, nama_asrama, nomor_kamar, kapasitas, musyrif_id } = await req.json();
    const query = `
      UPDATE data_kamar 
      SET tingkat = $1, nama_asrama = $2, nomor_kamar = $3, kapasitas = $4, musyrif_id = $5 
      WHERE id = $6 RETURNING *;
    `;
    const res = await pool.query(query, [
      tingkat || 10,
      nama_asrama.trim(),
      nomor_kamar.trim(),
      kapasitas || 10,
      musyrif_id || null,
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
    await pool.query('DELETE FROM data_kamar WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus kamar' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}