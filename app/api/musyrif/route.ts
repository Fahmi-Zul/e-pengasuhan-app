import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get('kategori');

    let query = 'SELECT * FROM data_musyrif';
    const params: any[] = [];

    // Jika filter dipilih selain 'all', sertakan musyrif yang berkategori 'Keduanya'
    if (kategori && kategori !== 'all') {
      query += ' WHERE kategori = $1 OR kategori = \'Keduanya\'';
      params.push(kategori);
    }

    query += ' ORDER BY nama_musyrif ASC;';
    const res = await pool.query(query, params);
    return NextResponse.json({ success: true, data: res.rows || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nama_musyrif, no_hp, unit_tugas, kategori } = await req.json();

    if (!nama_musyrif || !nama_musyrif.trim()) {
      return NextResponse.json({ success: false, error: 'Nama Musyrif wajib diisi' }, { status: 400 });
    }

    const cleanNama = nama_musyrif.trim();

    // Validasi Cek Duplikat Nama Musyrif
    const checkExist = await pool.query(
      `SELECT id FROM data_musyrif WHERE LOWER(TRIM(nama_musyrif)) = LOWER($1)`,
      [cleanNama]
    );

    if (checkExist.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: `Gagal: Nama Musyrif "${cleanNama}" sudah terdaftar di database!` },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO data_musyrif (nama_musyrif, no_hp, unit_tugas, kategori)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const res = await pool.query(query, [
      cleanNama,
      no_hp || '',
      unit_tugas || 'SMA Putra',
      kategori || 'Asrama',
    ]);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, nama_musyrif, no_hp, unit_tugas, kategori } = await req.json();
    const cleanNama = nama_musyrif.trim();

    const checkExist = await pool.query(
      `SELECT id FROM data_musyrif WHERE LOWER(TRIM(nama_musyrif)) = LOWER($1) AND id != $2`,
      [cleanNama, id]
    );

    if (checkExist.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: `Gagal: Nama Musyrif "${cleanNama}" sudah digunakan oleh data lain!` },
        { status: 400 }
      );
    }

    const query = `
      UPDATE data_musyrif 
      SET nama_musyrif = $1, no_hp = $2, unit_tugas = $3, kategori = $4 
      WHERE id = $5 RETURNING *;
    `;
    const res = await pool.query(query, [
      cleanNama,
      no_hp || '',
      unit_tugas || 'SMA Putra',
      kategori || 'Asrama',
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
    await pool.query('DELETE FROM data_musyrif WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus musyrif' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}