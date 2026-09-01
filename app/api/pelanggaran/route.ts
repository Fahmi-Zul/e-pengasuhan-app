import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ranah = searchParams.get('ranah') || 'sekolah';

    const query = `
      SELECT 
        p.id,
        p.santri_id,
        s.nama_santri,
        s.id_kelas,
        COALESCE(k.nama_kelas, '-') AS nama_kelas,
        p.ranah,
        p.jenis_pelanggaran,
        p.poin,
        TO_CHAR(p.tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(p.waktu, 'HH24:MI') AS waktu,
        COALESCE(p.sesi_waktu, '-') AS sesi_waktu,
        p.guru_pelapor_id,
        COALESCE(g.nama_guru, '-') AS guru_pelapor,
        p.keterangan
      FROM data_pelanggaran p
      JOIN data_santri s ON p.santri_id = s.id
      LEFT JOIN data_kelas k ON s.id_kelas = k.id
      LEFT JOIN data_guru g ON p.guru_pelapor_id = g.id
      WHERE p.ranah = $1
      ORDER BY p.tanggal DESC, p.waktu DESC, p.id DESC;
    `;
    const res = await pool.query(query, [ranah]);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { santri_id, ranah, jenis_pelanggaran, poin, tanggal, waktu, sesi_waktu, guru_pelapor_id, keterangan } = await req.json();

    const parsedSantriId = parseInt(santri_id, 10);
    const parsedGuruId = parseInt(guru_pelapor_id, 10);

    if (!parsedSantriId || isNaN(parsedSantriId)) {
      return NextResponse.json({ success: false, error: 'Nama Santri wajib diisi' }, { status: 400 });
    }

    if (!parsedGuruId || isNaN(parsedGuruId)) {
      return NextResponse.json({ success: false, error: 'Guru Pelapor wajib dipilih' }, { status: 400 });
    }

    if (!jenis_pelanggaran || !jenis_pelanggaran.trim()) {
      return NextResponse.json({ success: false, error: 'Jenis Pelanggaran wajib dipilih' }, { status: 400 });
    }

    const query = `
      INSERT INTO data_pelanggaran (santri_id, ranah, jenis_pelanggaran, poin, tanggal, waktu, sesi_waktu, guru_pelapor_id, keterangan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const res = await pool.query(query, [
      parsedSantriId,
      ranah || 'sekolah',
      jenis_pelanggaran.trim(),
      poin || 5,
      tanggal || new Date(),
      waktu || '12:00',
      sesi_waktu || '-',
      parsedGuruId,
      keterangan || '',
    ]);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, santri_id, ranah, jenis_pelanggaran, poin, tanggal, waktu, sesi_waktu, guru_pelapor_id, keterangan } = await req.json();

    const parsedId = parseInt(id, 10);
    const parsedSantriId = parseInt(santri_id, 10);
    const parsedGuruId = parseInt(guru_pelapor_id, 10);

    if (!parsedId || isNaN(parsedId)) {
      return NextResponse.json({ success: false, error: 'ID data tidak valid' }, { status: 400 });
    }

    const query = `
      UPDATE data_pelanggaran 
      SET santri_id = $1, ranah = $2, jenis_pelanggaran = $3, poin = $4, tanggal = $5, waktu = $6, sesi_waktu = $7, guru_pelapor_id = $8, keterangan = $9
      WHERE id = $10 RETURNING *;
    `;
    const res = await pool.query(query, [
      parsedSantriId,
      ranah || 'sekolah',
      jenis_pelanggaran.trim(),
      poin || 5,
      tanggal || new Date(),
      waktu || '12:00',
      sesi_waktu || '-',
      parsedGuruId,
      keterangan || '',
      parsedId,
    ]);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await pool.query('DELETE FROM data_pelanggaran WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus catatan pelanggaran' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}