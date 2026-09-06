# Erafone & More Sales Performance Dashboard

Dashboard untuk melihat target, MTD, proyeksi akhir bulan, achievement, gap, kontribusi kategori, dan growth sales. Dashboard berada di `/dashboard`, sedangkan input dan edit data berada di `/admin`.

> Baru pertama kali memakai aplikasi? Ikuti [PANDUAN-LOCALHOST.md](./PANDUAN-LOCALHOST.md) dari langkah pertama tanpa dilewati.

> Ingin memasangnya secara online gratis? Ikuti [DEPLOY-GRATIS.md](./DEPLOY-GRATIS.md).

## Perintah cepat untuk pengguna yang sudah siap

Pastikan Node.js 20.9+, MySQL aktif, database `erafone` sudah dibuat, dan `.env` sudah benar.

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Buka `http://localhost:3000/dashboard`, lalu pilih **Agustus 2026** untuk melihat data awal. Login admin berada di `http://localhost:3000/admin`.

Jangan pernah mengunggah file `.env` karena berisi akses database dan akun admin.

## Deploy

Rekomendasi gratis untuk aplikasi ini adalah Netlify Free untuk aplikasi dan Aiven Free untuk MySQL. Tambahkan seluruh environment variable ke Netlify, lalu jalankan `npx prisma migrate deploy` dan `npm run prisma:seed` terhadap database Aiven satu kali. Seed bersifat idempotent untuk store, target, dan entry referensi. Langkah lengkap, migrasi data lokal, troubleshooting, dan batas free tier ada di `DEPLOY-GRATIS.md`.

## Audit rumus

Semua rumus murni berada di `lib/calculations.ts`:

- `calculateExpect`: MTD × total hari / hari berjalan.
- `calculateAchievement`: Expect / Target × 100.
- `calculateGap`: Target − MTD.
- `calculateTargetByDay`: Gap / sisa hari.
- `calculateContribution`: MTD kategori / total MTD × 100.
- `calculateGrowth`: (Expect bulan ini − actual final bulan lalu) / actual final bulan lalu × 100.

`app/api/dashboard/route.ts` mengambil entry terbaru per sales/kategori untuk bulan terpilih, menentukan hari snapshot dari tanggal entry terbaru, lalu memanggil fungsi-fungsi tersebut. Bila bulan lalu tidak punya entry, growth dikirim sebagai `null` dan UI menampilkan `-`. Unit test ada di `lib/calculations.test.ts` dan dijalankan dengan `npm test`.

## Sinkronisasi dan debugging data

- `app/api/dashboard/route.ts` memakai `dynamic = "force-dynamic"`, `revalidate = 0`, `fetchCache = "force-no-store"`, query Prisma baru pada setiap request, dan header HTTP `no-store`.
- Seluruh route mutasi di `app/api/admin/**` memanggil `revalidateDashboard()` setelah create/update/delete.
- `components/admin-client.tsx` memanggil SWR `mutate()` setelah mutasi berhasil.
- `components/dashboard-client.tsx` memakai interval refetch 10 detik dan revalidate saat tab kembali fokus. Ini menjamin tab/perangkat lain menyusul maksimal sekitar 10 detik tanpa WebSocket.

Jika perubahan tidak muncul, periksa berurutan: response mutasi admin, isi tabel MySQL, response `/api/dashboard?month=8&year=2026` (pastikan header `Cache-Control: no-store`), lalu request berkala di Network tab browser.

## Catatan konsistensi data referensi

Target kategori yang diberikan per sales berjumlah Rp477.932.019, bukan Rp479.780.455 seperti baris TOTAL ALL. Total seluruh target kategori adalah Rp1.911.728.076 berdasarkan empat nilai seed identik, bukan Rp1.919.121.822. Aplikasi sengaja menghitung total dari record kategori di database supaya edit admin selalu konsisten dan tidak ditimpa angka hardcode. MTD seed dan actual final Juli disimpan persis; nilai Juli dibagi proporsional per kategori dengan metode largest remainder sehingga total setiap sales tetap persis.

## Pemeriksaan

```bash
npm test
npx tsc --noEmit
npm run build
```

Bulk upload Excel/CSV tidak disertakan karena ditandai opsional; fitur inti CRUD dan kalkulasi tidak bergantung padanya.
