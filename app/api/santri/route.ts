import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

async function getOrCreateKelasId(namaKelas: string) {
  if (!namaKelas || namaKelas.trim() === '') return null;
  const cleanNama = namaKelas.trim();

  const checkRes = await pool.query(
    'SELECT id FROM data_kelas WHERE LOWER(nama_kelas) = LOWER($1)',
    [cleanNama]
  );

  if (checkRes.rows.length > 0) {
    return checkRes.rows[0].id;
  }

  const tingkatMatch = cleanNama.match(/\d+/);
  const tingkatVal = tingkatMatch ? parseInt(tingkatMatch[0], 10) : 10;

  const insertRes = await pool.query(
    'INSERT INTO data_kelas (nama_kelas, tingkat) VALUES ($1, $2) RETURNING id',
    [cleanNama, tingkatVal]
  );
  return insertRes.rows[0].id;
}

export async function GET() {
  try {
    const query = `
      SELECT 
        s.id, 
        s.nisn, 
        s.nama_santri, 
        s.status_aktif, 
        COALESCE(k.nama_kelas, '-') AS nama_kelas,
        COALESCE(k.nama_kelas, '-') AS kelas
      FROM data_santri s
      LEFT JOIN data_kelas k ON s.id_kelas = k.id
      ORDER BY k.nama_kelas ASC NULLS LAST, s.nama_santri ASC;
    `;
    const result = await pool.query(query);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nisn, nama_santri, nama_kelas } = await req.json();
    const idKelas = await getOrCreateKelasId(nama_kelas);

    const query = `
      INSERT INTO data_santri (nisn, nama_santri, status_aktif, id_kelas)
      VALUES ($1, $2, true, $3)
      RETURNING *;
    `;
    const result = await pool.query(query, [nisn, nama_santri, idKelas]);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, nisn, nama_santri, nama_kelas } = await req.json();
    const idKelas = await getOrCreateKelasId(nama_kelas);

    const query = `
      UPDATE data_santri 
      SET nisn = $1, nama_santri = $2, id_kelas = $3 
      WHERE id = $4
      RETURNING *;
    `;
    const result = await pool.query(query, [nisn, nama_santri, idKelas, id]);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();
    if (!ids || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada ID yang dipilih' }, { status: 400 });
    }

    const query = `DELETE FROM data_santri WHERE id = ANY($1::int[])`;
    await pool.query(query, [ids]);

    return NextResponse.json({ success: true, message: 'Berhasil menghapus data santri' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}