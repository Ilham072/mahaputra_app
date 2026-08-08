# UAT Checklist

Panduan ini menyiapkan data demo lokal dan alur cek manual untuk MVP Mahaputra Apps.

## Setup Lokal

Prasyarat:

- Laragon berjalan dengan MySQL aktif.
- `.env` memakai koneksi database lokal Mahaputra Apps.
- Migrasi sudah dijalankan.

Jalankan data dasar dan data UAT:

```bash
php artisan migrate
php artisan db:seed
php artisan db:seed --class=UatDemoSeeder
```

Login demo:

- Admin: `admin@mahaputra.local` / `password`
- Owner: `owner@mahaputra.local` / `password`

Data UAT yang tersedia:

- `DD 1801 UAT`: kendaraan READY KHUSUS untuk uji penjualan CASH, termasuk cover foto.
- `DD 1802 UAT`: kendaraan READY UMUM dengan kolaborator untuk uji penjualan CREDIT, termasuk cover foto.
- `DD 1803 UAT`: kendaraan PREPARATION untuk cek status persiapan.
- `DD 1804 UAT`: kendaraan SOLD CASH untuk laporan dan export, termasuk cover foto.
- `DD 1805 UAT`: kendaraan SOLD CREDIT untuk laporan dan export, termasuk cover foto.

Semua file KTP, STNK/BPKB, foto kendaraan, dan bukti operasional dari seeder adalah placeholder lokal, bukan dokumen asli.

## Flow Admin Cash

- Login sebagai Admin.
- Buka Kendaraan dan pastikan `DD 1801 UAT` tampil sebagai READY.
- Pastikan cover foto tampil di card kendaraan dan detail kendaraan.
- Tambahkan foto kendaraan dari detail kendaraan jika perlu.
- Klik PDF Internal dari detail kendaraan dan pastikan file PDF terunduh.
- Tambahkan atau cek biaya kendaraan.
- Buat penjualan CASH untuk kendaraan tersebut.
- Pastikan field kredit tidak wajib dan tidak tersimpan pada pembayaran CASH.
- Pastikan kendaraan berubah menjadi SOLD.
- Buka Laporan, filter periode Agustus 2026.
- Pastikan transaksi CASH tampil dan bisa diexport Excel/PDF.

## Flow Admin Credit

- Login sebagai Admin.
- Buka Kendaraan dan pastikan `DD 1802 UAT` tampil sebagai READY dan bertipe UMUM.
- Pastikan galeri foto kendaraan dapat menampilkan foto cover.
- Klik PDF Internal dari detail kendaraan dan pastikan modal UMUM/kolaborator muncul.
- Pastikan kolaborator serta modal showroom/kolaborator terlihat.
- Buat penjualan CREDIT dengan provider pembiayaan.
- Isi DP, DP Terutang, Cair Pembiayaan, dan Refund.
- Pastikan laba dihitung dari total nilai penjualan kredit dikurangi modal akhir.
- Buka Laporan, filter periode Agustus 2026.
- Pastikan transaksi CREDIT tampil dan bisa diexport Excel/PDF.

## Flow Owner

- Login sebagai Owner.
- Pastikan Owner dapat membuka Dashboard dan Laporan.
- Pastikan Owner dapat melihat foto kendaraan tetapi tidak dapat menambah, menghapus, atau mengubah cover foto.
- Pastikan Owner dapat mengunduh PDF Internal kendaraan.
- Pastikan Owner tidak dapat membuat, mengubah, atau menghapus data transaksi.
- Filter laporan periode Agustus 2026.
- Export Excel dan PDF dari laporan.
- Cek ringkasan penjualan, modal akhir, laba kendaraan, dan operasional.

## Checklist Export

- Excel terbuka dan memuat baris penjualan CASH dan CREDIT.
- PDF terunduh dari browser dan memuat ringkasan laporan.
- PDF Internal kendaraan memuat modal, biaya, dokumen, dan status kendaraan.
- Export tetap mengikuti filter periode, payment type, area, dan PIC.
- Tidak ada KTP/STNK/BPKB asli yang terekspos di hasil export.

## Batasan MVP

- Format akhir PDF internal/customer masih menunggu keputusan PRD `OQ-011`.
- Formula final Keuntungan Perusahaan setelah pembagian laba UMUM masih menunggu keputusan PRD `OQ-014`.
- Jumlah foto kendaraan final masih menunggu keputusan PRD/UI; MVP membatasi maksimal 5 foto per kendaraan.
- Data UAT hanya untuk environment `local` dan `testing`; seeder tidak berjalan di environment lain.
