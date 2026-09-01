import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    // Ambil semua data (termasuk kolom ttd_1_url, ttd_2_url, cap_url)
    const res = await pool.query("SELECT * FROM settings LIMIT 1");
    return NextResponse.json({ success: true, data: res.rows[0] || {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    
    const check = await pool.query("SELECT id FROM settings LIMIT 1");
    
    if (check.rows.length > 0) {
      // UPDATE data jika sudah ada (Tambahkan kolom gambar)
      await pool.query(`
        UPDATE settings SET 
          nama_instansi = $1, 
          alamat = $2, 
          kontak = $3, 
          logo_url = $4,
          pejabat_1_nama = $5,
          pejabat_1_jabatan = $6,
          pejabat_2_nama = $7,
          pejabat_2_jabatan = $8,
          pejabat_3_nama = $9,
          pejabat_3_jabatan = $10,
          ttd_1_url = $11,
          ttd_2_url = $12,
          cap_url = $13
      `, [
        data.nama_instansi, data.alamat, data.kontak, data.logo_url,
        data.pejabat_1_nama, data.pejabat_1_jabatan, 
        data.pejabat_2_nama, data.pejabat_2_jabatan,
        data.pejabat_3_nama, data.pejabat_3_jabatan,
        data.ttd_1_url, data.ttd_2_url, data.cap_url
      ]);
    } else {
      // INSERT data baru jika tabel masih kosong
      await pool.query(`
        INSERT INTO settings (
          nama_instansi, alamat, kontak, logo_url, 
          pejabat_1_nama, pejabat_1_jabatan, 
          pejabat_2_nama, pejabat_2_jabatan, 
          pejabat_3_nama, pejabat_3_jabatan,
          ttd_1_url, ttd_2_url, cap_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        data.nama_instansi, data.alamat, data.kontak, data.logo_url,
        data.pejabat_1_nama, data.pejabat_1_jabatan, 
        data.pejabat_2_nama, data.pejabat_2_jabatan,
        data.pejabat_3_nama, data.pejabat_3_jabatan,
        data.ttd_1_url, data.ttd_2_url, data.cap_url
      ]);
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}