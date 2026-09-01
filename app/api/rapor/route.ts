import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const query = `
      SELECT r.*, s.nama_santri
      FROM data_rapor r
      LEFT JOIN data_santri s ON r.santri_id = s.id
      ORDER BY r.id DESC;
    `;
    const res = await pool.query(query);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const fields = Object.keys(data).filter(key => key !== 'id');
    const values = fields.map(key => data[key]);
    
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO data_rapor (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    const res = await pool.query(query, values);
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await pool.query('DELETE FROM data_rapor WHERE id = $1', [parseInt(id, 10)]);
    return NextResponse.json({ success: true, message: 'Berhasil menghapus data rapor' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}