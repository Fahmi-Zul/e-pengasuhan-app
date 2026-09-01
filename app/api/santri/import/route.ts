import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), 'data santri.xlsx');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        success: false,
        error: 'File "data santri.xlsx" tidak ditemukan di folder proyek.'
      }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let countInserted = 0;
    let countUpdated = 0;
    let countSkipped = 0;

    for (const row of sheetData) {
      const nisn = row.nisn ? String(row.nisn).trim() : '';
      const nama = row.Nama ? String(row.Nama).trim() : '';
      const namaKelas = row.kelas ? String(row.kelas).trim() : '';

      if (!nama) continue;

      let idKelas = null;
      if (namaKelas) {
        const checkKelas = await pool.query(
          'SELECT id FROM data_kelas WHERE LOWER(nama_kelas) = LOWER($1)',
          [namaKelas]
        );

        if (checkKelas.rows.length > 0) {
          idKelas = checkKelas.rows[0].id;
        } else {
          const tingkatMatch = namaKelas.match(/\d+/);
          const tingkatVal = tingkatMatch ? parseInt(tingkatMatch[0], 10) : 10;

          const newKelas = await pool.query(
            'INSERT INTO data_kelas (nama_kelas, tingkat) VALUES ($1, $2) RETURNING id',
            [namaKelas, tingkatVal]
          );
          idKelas = newKelas.rows[0].id;
        }
      }

      let checkSantri;
      if (nisn) {
        checkSantri = await pool.query(
          'SELECT id, nisn, nama_santri, id_kelas FROM data_santri WHERE nisn = $1',
          [nisn]
        );
      } else {
        checkSantri = await pool.query(
          `SELECT id, nisn, nama_santri, id_kelas FROM data_santri 
           WHERE LOWER(nama_santri) = LOWER($1) 
           AND (id_kelas = $2 OR ($2 IS NULL AND id_kelas IS NULL))`,
          [nama, idKelas]
        );
      }

      if (checkSantri.rows.length > 0) {
        const current = checkSantri.rows[0];

        if (current.nisn === nisn && current.nama_santri.toLowerCase() === nama.toLowerCase() && current.id_kelas === idKelas) {
          countSkipped++;
          continue;
        }

        await pool.query(
          'UPDATE data_santri SET nama_santri = $1, id_kelas = $2, status_aktif = true WHERE id = $3',
          [nama, idKelas, current.id]
        );
        countUpdated++;
      } else {
        await pool.query(
          'INSERT INTO data_santri (nisn, nama_santri, status_aktif, id_kelas) VALUES ($1, $2, true, $3)',
          [nisn, nama, idKelas]
        );
        countInserted++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Impor Berhasil! Data Baru: ${countInserted}, Data Diperbarui: ${countUpdated}, Data Permanen Dieliminasi: ${countSkipped}`,
    });
  } catch (error: any) {
    console.error('Error import excel:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}