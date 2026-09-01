import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        h.id,
        h.nama_halaqah,
        h.musyrif_id,
        COALESCE(m.nama_musyrif, '-') AS nama_musyrif,
        COALESCE(
          json_agg(
            json_build_object(
              'santri_id', s.id,
              'nama_santri', s.nama_santri,
              'nama_kelas', COALESCE(k.nama_kelas, '-')
            )
          ) FILTER (WHERE s.id IS NOT NULL), '[]'
        ) AS anggota
      FROM data_halaqah h
      LEFT JOIN data_musyrif m ON h.musyrif_id = m.id
      LEFT JOIN anggota_halaqah ah ON h.id = ah.halaqah_id
      LEFT JOIN data_santri s ON ah.santri_id = s.id
      LEFT JOIN data_kelas k ON s.id_kelas = k.id
      GROUP BY h.id, h.nama_halaqah, h.musyrif_id, m.nama_musyrif
      ORDER BY h.nama_halaqah ASC;
    `;
    const res = await pool.query(query);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const { nama_halaqah, musyrif_id, santri_ids } = await req.json();

    if (!nama_halaqah || !musyrif_id) {
      return NextResponse.json({ success: false, error: 'Nama Halaqoh dan Musyrif wajib dipilih' }, { status: 400 });
    }

    await client.query('BEGIN');

    const insHalaqah = await client.query(
      `INSERT INTO data_halaqah (nama_halaqah, musyrif_id) VALUES ($1, $2) RETURNING id`,
      [nama_halaqah.trim(), musyrif_id]
    );
    const halaqahId = insHalaqah.rows[0].id;

    if (santri_ids && Array.isArray(santri_ids) && santri_ids.length > 0) {
      for (const sId of santri_ids) {
        await client.query(
          `INSERT INTO anggota_halaqah (halaqah_id, santri_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [halaqahId, sId]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: 'Kelompok Al-Qur\'an berhasil dibuat' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// METHOD PUT UNTUK UPDATE DATA HALAQOH
export async function PUT(req: Request) {
  const client = await pool.connect();
  try {
    const { id, nama_halaqah, musyrif_id, santri_ids } = await req.json();

    if (!id || !nama_halaqah || !musyrif_id) {
      return NextResponse.json({ success: false, error: 'Data update tidak lengkap' }, { status: 400 });
    }

    await client.query('BEGIN');

    // Update nama dan musyrif
    await client.query(
      `UPDATE data_halaqah SET nama_halaqah = $1, musyrif_id = $2 WHERE id = $3`,
      [nama_halaqah.trim(), musyrif_id, id]
    );

    // Reset dan atur ulang anggota
    await client.query(`DELETE FROM anggota_halaqah WHERE halaqah_id = $1`, [id]);

    if (santri_ids && Array.isArray(santri_ids) && santri_ids.length > 0) {
      for (const sId of santri_ids) {
        await client.query(
          `INSERT INTO anggota_halaqah (halaqah_id, santri_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, sId]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: 'Kelompok Al-Qur\'an berhasil diperbarui' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await pool.query('DELETE FROM data_halaqah WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus kelompok halaqoh' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}