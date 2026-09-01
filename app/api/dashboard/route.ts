import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'bulanan';

    // 1. Total Entitas Pengguna
    const totalSantriRes = await pool.query("SELECT COUNT(*) FROM data_santri;");
    const totalGuruRes = await pool.query("SELECT COUNT(*) FROM data_guru;");
    const totalMusyrifRes = await pool.query("SELECT COUNT(*) FROM data_musyrif;");

    // 2. Kalkulasi Perbandingan Periode
    let currentWhere = "tanggal >= CURRENT_DATE - INTERVAL '30 days'";
    let prevWhere = "tanggal >= CURRENT_DATE - INTERVAL '60 days' AND tanggal < CURRENT_DATE - INTERVAL '30 days'";
    let labelPeriode = "Bulan Ini vs Bulan Lalu";

    if (filter === 'harian') {
      currentWhere = "tanggal = CURRENT_DATE";
      prevWhere = "tanggal = CURRENT_DATE - INTERVAL '1 day'";
      labelPeriode = "Hari Ini vs Kemarin";
    } else if (filter === 'mingguan') {
      currentWhere = "tanggal >= CURRENT_DATE - INTERVAL '6 days'";
      prevWhere = "tanggal >= CURRENT_DATE - INTERVAL '13 days' AND tanggal < CURRENT_DATE - INTERVAL '6 days'";
      labelPeriode = "Minggu Ini vs Minggu Lalu";
    } else if (filter === 'persemester') {
      currentWhere = "tanggal >= CURRENT_DATE - INTERVAL '6 months'";
      prevWhere = "tanggal >= CURRENT_DATE - INTERVAL '12 months' AND tanggal < CURRENT_DATE - INTERVAL '6 months'";
      labelPeriode = "Semester Ini vs Semester Lalu";
    } else if (filter === 'tahunan') {
      currentWhere = "tanggal >= CURRENT_DATE - INTERVAL '1 year'";
      prevWhere = "tanggal >= CURRENT_DATE - INTERVAL '2 years' AND tanggal < CURRENT_DATE - INTERVAL '1 year'";
      labelPeriode = "Tahun Ini vs Tahun Lalu";
    }

    const currentStatsRes = await pool.query(`SELECT COUNT(*) as kasus, COALESCE(SUM(poin), 0) as poin FROM data_pelanggaran WHERE ${currentWhere};`);
    const prevStatsRes = await pool.query(`SELECT COUNT(*) as kasus, COALESCE(SUM(poin), 0) as poin FROM data_pelanggaran WHERE ${prevWhere};`);

    const currKasus = parseInt(currentStatsRes.rows[0]?.kasus || '0', 10);
    const prevKasus = parseInt(prevStatsRes.rows[0]?.kasus || '0', 10);
    const diffKasus = currKasus - prevKasus;
    const isIncrease = diffKasus > 0;

    let percentChange = 0;
    if (prevKasus > 0) {
      percentChange = Math.round((Math.abs(diffKasus) / prevKasus) * 100);
    } else if (currKasus > 0) {
      percentChange = 100;
    }

    // 3. Query Kurva Dynamic
    let trendQuery = "";

    if (filter === 'harian') {
      trendQuery = `
        WITH hours AS (
          SELECT generate_series(
            date_trunc('day', CURRENT_TIMESTAMP) + interval '6 hours',
            date_trunc('day', CURRENT_TIMESTAMP) + interval '21 hours',
            '3 hours'::interval
          ) AS h
        )
        SELECT 
          TO_CHAR(hours.h, 'HH24:00') AS label,
          COALESCE(SUM(CASE WHEN p.ranah = 'sekolah' THEN p.poin ELSE 0 END), 0)::int AS sekolah,
          COALESCE(SUM(CASE WHEN p.ranah = 'asrama' THEN p.poin ELSE 0 END), 0)::int AS asrama,
          COALESCE(SUM(CASE WHEN p.ranah = 'quran' THEN p.poin ELSE 0 END), 0)::int AS quran
        FROM hours
        LEFT JOIN data_pelanggaran p ON p.tanggal = CURRENT_DATE AND p.waktu >= hours.h::time AND p.waktu < (hours.h + interval '3 hours')::time
        GROUP BY hours.h ORDER BY hours.h ASC;
      `;
    } else if (filter === 'mingguan') {
      trendQuery = `
        WITH dates AS (
          SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval)::date AS d
        )
        SELECT 
          TO_CHAR(dates.d, 'Dy') AS label,
          COALESCE(SUM(CASE WHEN p.ranah = 'sekolah' THEN p.poin ELSE 0 END), 0)::int AS sekolah,
          COALESCE(SUM(CASE WHEN p.ranah = 'asrama' THEN p.poin ELSE 0 END), 0)::int AS asrama,
          COALESCE(SUM(CASE WHEN p.ranah = 'quran' THEN p.poin ELSE 0 END), 0)::int AS quran
        FROM dates LEFT JOIN data_pelanggaran p ON p.tanggal = dates.d
        GROUP BY dates.d ORDER BY dates.d ASC;
      `;
    } else if (filter === 'bulanan') {
      trendQuery = `
        WITH weeks AS (SELECT generate_series(1, 4) AS w)
        SELECT 
          'Minggu ' || weeks.w AS label,
          COALESCE(SUM(CASE WHEN p.ranah = 'sekolah' THEN p.poin ELSE 0 END), 0)::int AS sekolah,
          COALESCE(SUM(CASE WHEN p.ranah = 'asrama' THEN p.poin ELSE 0 END), 0)::int AS asrama,
          COALESCE(SUM(CASE WHEN p.ranah = 'quran' THEN p.poin ELSE 0 END), 0)::int AS quran
        FROM weeks
        LEFT JOIN data_pelanggaran p ON TO_CHAR(p.tanggal, 'W')::int = weeks.w AND date_trunc('month', p.tanggal) = date_trunc('month', CURRENT_DATE)
        GROUP BY weeks.w ORDER BY weeks.w ASC;
      `;
    } else if (filter === 'persemester') {
      trendQuery = `
        WITH months AS (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
          )::date AS m
        )
        SELECT 
          TO_CHAR(months.m, 'Mon') AS label,
          COALESCE(SUM(CASE WHEN p.ranah = 'sekolah' THEN p.poin ELSE 0 END), 0)::int AS sekolah,
          COALESCE(SUM(CASE WHEN p.ranah = 'asrama' THEN p.poin ELSE 0 END), 0)::int AS asrama,
          COALESCE(SUM(CASE WHEN p.ranah = 'quran' THEN p.poin ELSE 0 END), 0)::int AS quran
        FROM months LEFT JOIN data_pelanggaran p ON date_trunc('month', p.tanggal) = months.m
        GROUP BY months.m ORDER BY months.m ASC;
      `;
    } else {
      trendQuery = `
        WITH months AS (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
          )::date AS m
        )
        SELECT 
          TO_CHAR(months.m, 'Mon YYYY') AS label,
          COALESCE(SUM(CASE WHEN p.ranah = 'sekolah' THEN p.poin ELSE 0 END), 0)::int AS sekolah,
          COALESCE(SUM(CASE WHEN p.ranah = 'asrama' THEN p.poin ELSE 0 END), 0)::int AS asrama,
          COALESCE(SUM(CASE WHEN p.ranah = 'quran' THEN p.poin ELSE 0 END), 0)::int AS quran
        FROM months LEFT JOIN data_pelanggaran p ON date_trunc('month', p.tanggal) = months.m
        GROUP BY months.m ORDER BY months.m ASC;
      `;
    }

    const trendRes = await pool.query(trendQuery);

    // 4. Breakdown
    const sekolahPerKelasRes = await pool.query(`
      SELECT COALESCE(k.nama_kelas, 'Umum') as label, COALESCE(SUM(p.poin), 0)::int as total_poin
      FROM data_pelanggaran p
      JOIN data_santri s ON p.santri_id = s.id
      LEFT JOIN data_kelas k ON s.id_kelas = k.id
      WHERE p.ranah = 'sekolah' GROUP BY k.nama_kelas ORDER BY total_poin DESC LIMIT 5;
    `);

    const asramaPerGedungRes = await pool.query(`
      SELECT 
        CASE 
          WHEN p.keterangan LIKE '%[Lokasi:%' THEN SPLIT_PART(SPLIT_PART(p.keterangan, '[Lokasi: ', 2), ']', 1)
          ELSE 'Asrama'
        END as label,
        COALESCE(SUM(p.poin), 0)::int as total_poin
      FROM data_pelanggaran p WHERE p.ranah = 'asrama' GROUP BY label ORDER BY total_poin DESC LIMIT 5;
    `);

    const quranPerKelompokRes = await pool.query(`
      SELECT COALESCE(p.sesi_waktu, 'Halaqoh') as label, COALESCE(SUM(p.poin), 0)::int as total_poin
      FROM data_pelanggaran p WHERE p.ranah = 'quran' GROUP BY p.sesi_waktu ORDER BY total_poin DESC LIMIT 5;
    `);

    // 5. Top 10 Indisipliner
    const topIndisiplinerRes = await pool.query(`
      SELECT s.id, s.nama_santri, COALESCE(k.nama_kelas, '-') AS nama_kelas,
             COALESCE(SUM(p.poin), 0)::int AS total_poin, COUNT(p.id)::int AS total_kasus
      FROM data_santri s
      LEFT JOIN data_kelas k ON s.id_kelas = k.id
      JOIN data_pelanggaran p ON s.id = p.santri_id
      GROUP BY s.id, s.nama_santri, k.nama_kelas ORDER BY total_poin DESC, total_kasus DESC LIMIT 10;
    `);

   // 6. Top 10 Terbaik (Terintegrasi Real-Time dengan Database Penilaian)
    const topTerbaikRes = await pool.query(`
      SELECT s.id, s.nama_santri, COALESCE(k.nama_kelas, '-') AS nama_kelas, 
             COALESCE(
               AVG(
                 (COALESCE(pa.aspek_1, 0) + 
                  COALESCE(pa.aspek_2, 0) + 
                  COALESCE(pa.aspek_3, 0) + 
                  COALESCE(pa.aspek_4, 0) + 
                  COALESCE(pa.aspek_5, 0) + 
                  COALESCE(pa.aspek_6, 0)) / 6.0
               ), 0
             ) AS skor_rata_rata
      FROM data_santri s
      LEFT JOIN data_kelas k ON s.id_kelas = k.id
      JOIN data_penilaian_asrama pa ON s.id = pa.santri_id
      WHERE s.id NOT IN (
        SELECT DISTINCT santri_id 
        FROM data_pelanggaran 
        WHERE santri_id IS NOT NULL
      )
      GROUP BY s.id, s.nama_santri, k.nama_kelas
      ORDER BY skor_rata_rata DESC, s.nama_santri ASC 
      LIMIT 10;
    `);

    return NextResponse.json({
      success: true,
      summary: {
        total_santri: parseInt(totalSantriRes.rows[0]?.count || '0', 10),
        total_guru: parseInt(totalGuruRes.rows[0]?.count || '0', 10),
        total_musyrif: parseInt(totalMusyrifRes.rows[0]?.count || '0', 10),
        curr_kasus: currKasus,
        prev_kasus: prevKasus,
        diff_kasus: Math.abs(diffKasus),
        percent_change: percentChange,
        is_increase: isIncrease,
        label_periode: labelPeriode,
      },
      breakdown: {
        sekolah: sekolahPerKelasRes.rows || [],
        asrama: asramaPerGedungRes.rows || [],
        quran: quranPerKelompokRes.rows || [],
      },
      trend: trendRes.rows || [],
      top_indisipliner: topIndisiplinerRes.rows || [],
      top_terbaik: topTerbaikRes.rows || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}