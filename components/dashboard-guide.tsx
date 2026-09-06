const Formula = ({ children }: { children: React.ReactNode }) => (
  <code className="mt-1 block overflow-x-auto rounded-lg bg-stone-900 px-3 py-2 text-xs text-emerald-300">
    {children}
  </code>
);

export function DashboardGuide() {
  return (
    <section className="card mt-6 overflow-hidden" id="panduan-dashboard">
      <details>
        <summary className="cursor-pointer list-none px-5 py-5 transition hover:bg-stone-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-stone-900">
                Panduan Lengkap Dashboard, Input, dan Rumus Excel
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Klik untuk melihat arti setiap angka, alur input, dan rumus jika
                perhitungan dilakukan manual di Excel.
              </p>
            </div>
            <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
              BUKA PANDUAN
            </span>
          </div>
        </summary>
        <div className="border-t border-stone-200 bg-stone-50/60 p-5 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-2">
            <GuideBlock title="1. Isi Dashboard">
              <GuideItem title="Filter bulan dan tahun">
                Menentukan periode target dan Daily Entry yang dihitung. Data
                seed tersedia pada Agustus 2026.
              </GuideItem>
              <GuideItem title="Total Target">
                Jumlah seluruh target sales dari semua kategori pada periode
                terpilih.
              </GuideItem>
              <GuideItem title="Total MTD">
                Jumlah pencapaian akumulatif terbaru. Sistem mengambil Daily
                Entry dengan tanggal paling besar untuk setiap sales dan
                kategori.
              </GuideItem>
              <GuideItem title="Total Expect">
                Proyeksi pencapaian sampai akhir bulan jika kecepatan penjualan
                tetap sama seperti hari snapshot.
              </GuideItem>
              <GuideItem title="Growth vs bulan lalu">
                Perbandingan Expect bulan ini dengan Actual Final bulan
                sebelumnya. Tanda “-” berarti data bulan lalu belum tersedia.
              </GuideItem>
              <GuideItem title="Total Gap">
                Target dikurangi MTD. Nilai negatif berarti MTD sudah melewati
                target.
              </GuideItem>
              <GuideItem title="Tabel performance">
                Menampilkan Target, MTD, Expect, Gap, kebutuhan Target/Hari, dan
                Achievement setiap sales per kategori serta totalnya.
              </GuideItem>
              <GuideItem title="Tiga chart">
                MTD by Category menunjukkan nominal; donut menunjukkan
                kontribusi; Achievement menunjukkan persentase dengan garis
                target 100%.
              </GuideItem>
              <GuideItem title="Segarkan dan auto-refresh">
                Tombol Segarkan mengambil data sekarang. Tanpa ditekan pun
                dashboard membaca ulang database setiap 10 detik.
              </GuideItem>
              <GuideItem title="Export Excel">
                Mengunduh satu laporan visual khusus periode yang sedang
                dipilih. File berisi tabel lengkap, kartu ringkasan, tiga grafik
                dashboard, ringkasan kategori, serta panduan rumus. Ganti filter
                bulan/tahun lebih dulu jika ingin mengekspor periode lain.
              </GuideItem>
            </GuideBlock>

            <GuideBlock title="2. Input Admin dan Arah Datanya">
              <GuideItem title="Input Sales">
                Isi nama sales dan pilih store. Sales menjadi pilihan pada
                Target dan Daily Entry. Jika dinonaktifkan, histori tetap
                tersimpan tetapi sales tidak dihitung di dashboard.
              </GuideItem>
              <GuideItem title="Input Target">
                Isi target omzet untuk satu sales, satu kategori, satu bulan,
                dan satu tahun. Contoh: Ahmad → Device → Agustus 2026 →
                Rp415.632.189. Ulangi untuk kelima kategori dan setiap sales.
              </GuideItem>
              <GuideItem title="Input Daily Entry">
                Isi nilai MTD akumulatif pada suatu tanggal, bukan omzet khusus
                hari tersebut. Contoh: jika total Device Ahmad tanggal 25
                Agustus sudah Rp365.658.560, masukkan angka total itu.
              </GuideItem>
              <GuideItem title="Entry berikutnya">
                Pada tanggal 26, buat entry baru berisi total akumulatif sampai
                tanggal 26. Dashboard otomatis mengabaikan snapshot tanggal 25
                dan memakai tanggal 26 sebagai data terbaru.
              </GuideItem>
              <GuideItem title="Edit data">
                Tekan Edit pada baris. Form akan masuk “Mode Edit”, terisi data
                lama, dan otomatis digulir ke layar. Ubah nilai lalu tekan
                Simpan Perubahan.
              </GuideItem>
              <GuideItem title="Alur ke dashboard">
                Admin menyimpan → API menulis MySQL → cache dashboard
                diinvalidasi → dashboard membaca ulang API dan menghitung semua
                angka serta chart.
              </GuideItem>
            </GuideBlock>
          </div>

          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-bold text-blue-950">
              3. Rumus jika Dikerjakan Manual di Excel
            </h3>
            <p className="mt-2 text-sm leading-6 text-blue-900">
              Contoh posisi: tanggal snapshot di <strong>B1</strong>, Target di{" "}
              <strong>C2</strong>, MTD di <strong>D2</strong>, Expect di{" "}
              <strong>E2</strong>, Gap di <strong>F2</strong>, dan Actual Final
              bulan lalu di <strong>H2</strong>.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <FormulaItem title="Jumlah hari dalam bulan">
                <Formula>=DAY(EOMONTH($B$1,0))</Formula>
              </FormulaItem>
              <FormulaItem title="Hari berjalan">
                <Formula>=DAY($B$1)</Formula>
              </FormulaItem>
              <FormulaItem title="Expect">
                <Formula>=ROUND(D2*(DAY(EOMONTH($B$1,0))/DAY($B$1)),0)</Formula>
              </FormulaItem>
              <FormulaItem title="Achievement %">
                <Formula>=IFERROR(E2/C2,0)</Formula>
              </FormulaItem>
              <FormulaItem title="Gap">
                <Formula>=C2-D2</Formula>
              </FormulaItem>
              <FormulaItem title="Target by Day">
                <Formula>
                  =IF(DAY(EOMONTH($B$1,0))-DAY($B$1)=0,0,F2/(DAY(EOMONTH($B$1,0))-DAY($B$1)))
                </Formula>
              </FormulaItem>
              <FormulaItem title="Kontribusi kategori">
                <Formula>=IFERROR(D2/SUM($D$2:$D$6),0)</Formula>
              </FormulaItem>
              <FormulaItem title="Growth bulan ke bulan">
                <Formula>=IFERROR((E2-H2)/H2,0)</Formula>
              </FormulaItem>
              <FormulaItem title="MTD dari daftar transaksi harian">
                <Formula>
                  =SUMIFS(KolomNilai,KolomSales,NamaSales,KolomKategori,Kategori,KolomTanggal,"&lt;="&amp;$B$1)
                </Formula>
              </FormulaItem>
            </div>
            <p className="mt-4 text-xs text-blue-800">
              Format Achievement, Kontribusi, dan Growth sebagai Percentage.
              Jika Excel Anda memakai titik koma sebagai pemisah fungsi, ganti
              setiap koma dengan titik koma.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <h3 className="font-bold">4. Hosting Gratis</h3>
            <p className="mt-2 text-sm leading-6">
              Gunakan <strong>Netlify Free</strong> untuk aplikasi Next.js dan{" "}
              <strong>Aiven MySQL Free</strong> untuk database online. Alurnya:
              upload source ke GitHub, buat MySQL Free di Aiven, jalankan
              migration/seed ke Aiven, lalu import repository di Netlify dan
              pasang DATABASE_URL serta kredensial admin pada Environment
              Variables.
            </p>
            <p className="mt-2 text-xs leading-5 text-emerald-800">
              Panduan langkah demi langkah, cara membawa data XAMPP, pengecekan
              setelah online, dan batas free tier tersedia di file{" "}
              <strong>DEPLOY-GRATIS.md</strong> pada folder proyek.
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>Penting:</strong> jangan menjumlahkan seluruh Daily Entry
            karena setiap entry sudah berupa nilai MTD akumulatif. Untuk
            dashboard, gunakan hanya snapshot paling baru pada bulan tersebut
            per sales dan kategori.
          </div>
        </div>
      </details>
    </section>
  );
}

function GuideBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="font-bold text-brand-700">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function GuideItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-bold text-stone-800">{title}</h4>
      <p className="mt-0.5 text-sm leading-6 text-stone-600">{children}</p>
    </div>
  );
}

function FormulaItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-blue-900">
        {title}
      </p>
      {children}
    </div>
  );
}
