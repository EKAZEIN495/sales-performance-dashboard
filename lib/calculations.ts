/** Mengembalikan jumlah hari kalender sebenarnya untuk bulan/tahun terkait. */
export function daysInMonth(month: number, year: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError("Bulan harus 1-12");
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Proyeksi akhir bulan berdasarkan laju MTD sampai hari snapshot. */
export function calculateExpect(mtd: number, totalDays: number, elapsedDays: number): number {
  if (elapsedDays <= 0 || totalDays <= 0) return 0;
  return mtd * (totalDays / elapsedDays);
}

/** Persentase pencapaian proyeksi (Expect), bukan MTD, terhadap target. */
export function calculateAchievement(expect: number, target: number): number | null {
  return target === 0 ? null : (expect / target) * 100;
}

/** Nilai yang masih dibutuhkan untuk menutup target dari MTD saat ini. */
export function calculateGap(target: number, mtd: number): number {
  return target - mtd;
}

/** Kebutuhan rata-rata per sisa hari. Pada hari terakhir tidak ada pembagi yang valid. */
export function calculateTargetByDay(gap: number, totalDays: number, elapsedDays: number): number | null {
  const remainingDays = totalDays - elapsedDays;
  return remainingDays <= 0 ? null : gap / remainingDays;
}

/** Porsi MTD sebuah kategori terhadap gabungan MTD semua kategori. */
export function calculateContribution(categoryMtd: number, totalMtd: number): number {
  return totalMtd === 0 ? 0 : (categoryMtd / totalMtd) * 100;
}

/** Pertumbuhan proyeksi bulan ini dibanding actual final bulan lalu. */
export function calculateGrowth(currentExpect: number, previousActual: number | null): number | null {
  if (previousActual === null || previousActual === 0) return null;
  return ((currentExpect - previousActual) / previousActual) * 100;
}

/** Pembulatan rupiah/angka tampilan mengikuti pembulatan matematika terdekat. */
export function roundValue(value: number): number {
  return Math.round(value);
}
