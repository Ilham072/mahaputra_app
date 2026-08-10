# Product Requirements Document — Mahaputra Apps

## 1. Document Information

* Status: DRAFT
* Owner: IT Product Development
* Stakeholders:

  * Owner Showroom Mahaputra Group
  * Admin Showroom
  * IT Product Development
  * Development Team
  * UI/UX Designer
* Version: 0.1
* Last updated: 2026-08-07
* Target release: TBD
* Related documents:

  * `docs/ARCHITECTURE.md`
  * `docs/UI_SPEC.md`
  * `Flow Chart Mahaputra Apps.docx`
  * Figma: TBD
  * Business Process / Research Notes: hasil diskusi dengan Admin Mahaputra Group

---

# 2. Executive Summary

**Mahaputra Apps** adalah aplikasi dashboard internal untuk membantu Mahaputra Group mengelola proses bisnis penjualan mobil bekas, mulai dari kendaraan masuk ke showroom, pencatatan modal dan biaya perbaikan, pengelolaan stok kendaraan, proses penjualan cash maupun kredit, pencatatan pelanggan, biaya operasional perusahaan, hingga penyusunan laporan dan analisis keuntungan.

Pengguna utama aplikasi adalah **Admin Showroom** yang bertanggung jawab melakukan input dan pengelolaan data operasional, serta **Owner** yang membutuhkan akses terhadap dashboard, laporan penjualan, keuntungan, kendaraan, dan biaya operasional.

Produk ini bertujuan mengubah proses pencatatan yang sebelumnya tersebar dan membutuhkan pengolahan manual menjadi satu sistem terintegrasi sehingga informasi kendaraan, transaksi, modal, biaya, dan keuntungan dapat ditelusuri dengan lebih cepat dan konsisten. Kebutuhan utama produk berasal dari hasil diskusi dengan admin penjualan Mahaputra Group.

---

# 3. Background and Problem Statement

## 3.1 Current situation

Proses bisnis Mahaputra Group mencakup:

1. Pembelian atau penerimaan kendaraan ke showroom.
2. Pencatatan informasi kendaraan.
3. Pencatatan sumber modal kendaraan.
4. Pencatatan biaya perbaikan dan administrasi kendaraan.
5. Penawaran kendaraan kepada pelanggan.
6. Proses negosiasi harga.
7. Penjualan menggunakan skema cash atau kredit.
8. Pencatatan data pembeli.
9. Penghitungan modal akhir dan laba kendaraan.
10. Pencatatan biaya operasional perusahaan.
11. Pembuatan rekap dan laporan.

Hasil riset awal menunjukkan kebutuhan agar seluruh proses tersebut dikelola melalui dashboard internal yang terintegrasi, termasuk pengelolaan kendaraan, transaksi penjualan, operasional, laporan, PDF, dan rekap data.

## 3.2 Core problem

Belum terdapat satu sistem terpusat yang menghubungkan:

* data kendaraan,
* modal kendaraan,
* kolaborator,
* biaya perbaikan,
* harga penawaran,
* harga transaksi,
* data pelanggan,
* pembayaran,
* laba kendaraan,
* biaya operasional,
* dan laporan perusahaan.

Kondisi tersebut dapat menyebabkan admin perlu melakukan pencatatan atau penghitungan secara terpisah dan meningkatkan risiko inkonsistensi data.

Owner juga membutuhkan cara yang lebih cepat untuk melihat kondisi penjualan dan performa usaha tanpa melakukan pengolahan data secara manual.

## 3.3 Impact

* Waktu pencatatan dan penyusunan laporan menjadi lebih lama.
* Admin berpotensi melakukan input data berulang.
* Penghitungan modal akhir dan laba berisiko tidak konsisten apabila dilakukan manual.
* Riwayat biaya kendaraan lebih sulit ditelusuri.
* Informasi penjualan dan keuntungan tidak langsung tersedia bagi Owner.
* Rekap transaksi membutuhkan pengolahan tambahan.
* Data internal dan data yang boleh diberikan kepada pelanggan berpotensi tercampur apabila tidak memiliki format laporan berbeda.

## 3.4 Evidence

* Hasil wawancara/diskusi dengan Admin Mahaputra Group.
* Dokumen riset awal `Flow Chart Mahaputra Apps.docx`.
* Terdapat dua skema kepemilikan modal kendaraan: **UMUM** dan **KHUSUS**.
* Terdapat dua mekanisme pembayaran: **CASH** dan **KREDIT**.
* Harga penawaran kendaraan dapat berbeda dari harga transaksi karena proses negosiasi.
* Kendaraan dapat memiliki berbagai biaya tambahan sebelum dijual.
* Biaya operasional perusahaan mempengaruhi keuntungan perusahaan.
* Owner membutuhkan dashboard grafik dan laporan.

---

# 4. Product Goals

## 4.1 Goals

* **G-01:** Menyediakan satu sumber data terpusat untuk kendaraan, penjualan, biaya, pelanggan, dan operasional showroom.
* **G-02:** Mengotomatisasi perhitungan modal akhir dan laba kendaraan berdasarkan business rules Mahaputra Group.
* **G-03:** Mempermudah Admin melakukan pencatatan kendaraan dan transaksi tanpa input berulang.
* **G-04:** Memberikan Owner dashboard dan laporan yang dapat digunakan untuk memonitor performa usaha.
* **G-05:** Menyediakan rekap data yang dapat diekspor ke PDF dan Excel.
* **G-06:** Memisahkan data internal perusahaan dari informasi yang ditampilkan pada dokumen pelanggan.

## 4.2 Success metrics

Karena belum tersedia baseline kuantitatif dari proses berjalan, target numerik akan ditentukan setelah observasi/UAT awal.

| Metric                                  | Baseline |                                  Target | Measurement method                           |
| --------------------------------------- | -------: | --------------------------------------: | -------------------------------------------- |
| Persentase kendaraan tercatat di sistem |      TBD |                     100% kendaraan baru | Perbandingan kendaraan fisik dengan database |
| Persentase transaksi tercatat di sistem |      TBD |                     100% transaksi baru | Audit transaksi penjualan                    |
| Akurasi perhitungan modal akhir         |   Manual |               100% sesuai business rule | Pengujian dengan contoh transaksi            |
| Akurasi perhitungan laba kendaraan      |   Manual |               100% sesuai business rule | Pengujian dengan transaksi referensi         |
| Keberhasilan export laporan             |      TBD |                   ≥ 99% pada data valid | Functional testing                           |
| Waktu pembuatan rekap                   |      TBD | Lebih cepat dibanding proses sebelumnya | UAT Admin                                    |
| Keberhasilan user journey utama         |      TBD |          100% skenario kritis lulus UAT | UAT checklist                                |

## 4.3 Non-goals

Untuk MVP, produk tidak ditujukan untuk:

* Menjadi marketplace publik penjualan mobil.
* Menyediakan portal pelanggan.
* Menyediakan aplikasi mobile native.
* Mengintegrasikan sistem langsung dengan leasing/pembiayaan.
* Melakukan integrasi pembayaran bank/payment gateway.
* Mengelola lebih dari satu kolaborator dalam satu kendaraan.
* Mengotomatisasi komunikasi WhatsApp kepada pelanggan.
* Menyediakan akuntansi perusahaan lengkap seperti neraca atau general ledger.
* Menyediakan penghitungan pembagian laba kolaborator sampai formula pembagian disepakati.
* Menyediakan histori perpindahan area sampai business process dikonfirmasi.

---

# 5. Users and Roles

## 5.1 Primary persona: Admin Showroom

* **Role:** Admin
* **Context:** Mengelola aktivitas administrasi kendaraan, penjualan, pelanggan, dan operasional showroom.
* **Goals:**

  * Mencatat kendaraan dengan cepat.
  * Mengetahui modal dan biaya setiap kendaraan.
  * Memproses transaksi penjualan.
  * Mengelola data pelanggan.
  * Membuat invoice dan laporan.
  * Menghasilkan rekap tanpa menghitung ulang secara manual.
* **Pain points:**

  * Banyak data saling berkaitan.
  * Berpotensi melakukan input data berulang.
  * Perhitungan modal dan keuntungan membutuhkan konsistensi.
  * Data kendaraan dan transaksi harus mudah dicari kembali.
* **Technical ability:** TBD melalui observasi pengguna.
* **Device/connectivity:** TBD. Aplikasi dirancang sebagai web responsive dengan penggunaan utama melalui desktop/laptop.

## 5.2 Additional persona: Owner

* **Role:** Owner
* **Context:** Memantau performa bisnis showroom.
* **Goals:**

  * Melihat penjualan.
  * Melihat jumlah kendaraan.
  * Melihat grafik keuntungan.
  * Melihat biaya operasional.
  * Membaca dan mengekspor laporan.
* **Pain points:**

  * Informasi bisnis tidak selalu tersedia dalam satu tampilan.
  * Membutuhkan laporan tanpa harus mengolah data operasional sendiri.
* **Technical ability:** TBD.
* **Device/connectivity:** Desktop dan mobile browser.

## 5.3 Role summary

| Role  | Main responsibility                  | Main permissions                                                                             |
| ----- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Admin | Mengelola aktivitas operasional      | Create, view, dan edit kendaraan, transaksi, pelanggan, biaya, dokumen, master data, laporan |
| Owner | Monitoring dan pengambilan keputusan | View dashboard, grafik, rekap, laporan, PDF dan Excel                                        |

---

# 6. Scope

## 6.1 MVP — In scope

### Authentication & Authorization

* Login.
* Role Admin.
* Role Owner.
* Pembatasan menu dan aksi berdasarkan role.

### Dashboard

* Grafik penjualan.
* Total kendaraan saat ini.
* Lima transaksi penjualan terbaru.
* Tombol menuju seluruh rekap penjualan.
* Grafik/diagram keuntungan.
* Ringkasan biaya operasional.
* Ringkasan performa perusahaan.

### Kendaraan

* Tambah kendaraan.
* Edit kendaraan.
* Detail kendaraan.
* Daftar kendaraan berbentuk card/marketplace.
* Upload foto kendaraan.
* Input tanggal pembelian kendaraan.
* Input dokumen STNK.
* Input dokumen BPKB.
* Upload dokumen.
* Status pajak.
* Input biaya pajak jika relevan.
* Pemilihan UMUM/KHUSUS.
* Data kolaborator.
* Modal showroom.
* Modal kolaborator.
* Biaya Dico.
* Biaya kelistrikan/kaki-kaki.
* Biaya tambahan dinamis.
* Harga penawaran kendaraan.
* Status kendaraan.
* Generate PDF internal kendaraan.

### Penjualan

* Tombol Terjual dari kendaraan.
* Data pelanggan.
* Upload foto KTP pelanggan.
* Area transaksi.
* PIC.
* Harga terjual.
* Pembayaran CASH.
* Pembayaran KREDIT.
* Data perusahaan pembiayaan.
* DP.
* DP Terutang.
* Dana cair pembiayaan.
* Refund.
* Penghitungan laba kendaraan.
* Edit transaksi terjual.
* Invoice PDF pelanggan.

### Operasional

* Input transaksi operasional.
* Jenis transaksi.
* Tanggal.
* Nominal.
* Upload bukti.
* Jenis transaksi lainnya secara manual.
* Riwayat transaksi operasional.

### Rekap & Reporting

* Rekap penjualan.
* Rekap operasional.
* Filter tanggal.
* Search.
* Filter tambahan sesuai kebutuhan.
* PDF.
* XLSX.

### Master Data

* Karyawan/PIC.
* Area.
* Merk kendaraan.
* Perusahaan pembiayaan.
* Jenis biaya operasional.
* Data dropdown yang dapat dikelola.

## 6.2 Out of scope

* Marketplace/public website.
* Pembayaran online.
* Integrasi API leasing.
* Integrasi WhatsApp.
* Multi-collaborator.
* Mobile native application.
* Sistem akuntansi lengkap.
* Automated bank reconciliation.
* Approval workflow kompleks.
* Pembagian laba kolaborator otomatis sampai formula final dikonfirmasi.
* Riwayat transfer kendaraan antar-area sampai kebutuhan dikonfirmasi.

## 6.3 Future considerations

* Audit trail lengkap.
* Histori perpindahan kendaraan antar-area.
* Multi-collaborator.
* Dashboard per area.
* Analisis harga penawaran dibandingkan harga terjual.
* Lama kendaraan berada di showroom.
* Analisis margin per kendaraan.
* Analisis performa PIC.
* Integrasi WhatsApp.
* Notifikasi internal.
* Integrasi lembaga pembiayaan.
* Approval perubahan transaksi keuangan.
* Sistem akuntansi lanjutan.

---

# 7. Main User Journeys

## Journey J-01 — Menambahkan Kendaraan

**Actor:** Admin

**Trigger:** Kendaraan baru dibeli/masuk ke showroom.

**Preconditions:**

* Admin sudah login.
* Master data yang diperlukan tersedia.

**Main flow:**

1. Admin membuka menu Tambah Kendaraan.
2. Admin menginput tanggal pembelian.
3. Admin menginput identitas kendaraan.
4. Admin mengupload foto kendaraan.
5. Admin menentukan status pajak.
6. Admin mencatat STNK dan BPKB.
7. Admin memilih tipe modal UMUM atau KHUSUS.
8. Sistem menampilkan field sesuai tipe modal.
9. Admin menginput modal.
10. Admin mencatat biaya kendaraan.
11. Admin menginput harga penawaran.
12. Admin menyimpan kendaraan.
13. Sistem menghitung modal awal dan modal akhir.
14. Kendaraan muncul pada Data Kendaraan.

**Alternative/exception flows:**

* A1. Jika kendaraan KHUSUS, sistem meminta kolaborator dan modal kolaborator.
* A2. Jika kendaraan UMUM, field kolaborator tidak ditampilkan.
* E1. Jika field wajib belum lengkap, sistem menolak penyimpanan dan menandai field terkait.
* E2. Jika upload gagal, sistem memberikan pesan kegagalan tanpa kehilangan data form yang telah diinput.

**Outcome:** Kendaraan tercatat di inventory.

---

## Journey J-02 — Menambahkan Biaya Kendaraan

**Actor:** Admin

**Trigger:** Kendaraan membutuhkan service/perbaikan atau pengeluaran tambahan.

**Preconditions:**

* Kendaraan sudah tersedia.

**Main flow:**

1. Admin membuka detail kendaraan.
2. Admin memilih tambah biaya.
3. Admin memilih kategori biaya.
4. Admin menginput nominal.
5. Admin menyimpan biaya.
6. Sistem menambahkan biaya ke total service tambahan.
7. Sistem menghitung ulang modal akhir.

**Outcome:** Modal akhir kendaraan diperbarui.

---

## Journey J-03 — Menjual Kendaraan Secara CASH

**Actor:** Admin

**Trigger:** Kendaraan berhasil dijual dengan pembayaran cash.

**Preconditions:**

* Kendaraan belum SOLD.
* Data kendaraan tersedia.

**Main flow:**

1. Admin menekan tombol Terjual.
2. Sistem membawa informasi kendaraan ke form penjualan.
3. Admin menginput data pembeli.
4. Admin memilih area.
5. Admin memilih PIC.
6. Admin memasukkan harga terjual.
7. Admin memilih CASH.
8. Sistem menyembunyikan seluruh field kredit.
9. Admin menyimpan transaksi.
10. Sistem menghitung laba kendaraan.
11. Status kendaraan menjadi SOLD.
12. Sistem menyediakan invoice pelanggan.

**Outcome:** Transaksi cash tercatat.

---

## Journey J-04 — Menjual Kendaraan Secara KREDIT

**Actor:** Admin

**Trigger:** Kendaraan berhasil dijual melalui pembiayaan.

**Preconditions:**

* Kendaraan belum SOLD.
* Perusahaan pembiayaan tersedia di master data.

**Main flow:**

1. Admin membuka form Terjual.
2. Admin menginput data pelanggan.
3. Admin memilih KREDIT.
4. Sistem menampilkan field pembiayaan.
5. Admin memilih perusahaan pembiayaan.
6. Admin menginput DP.
7. Admin menginput DP Terutang jika ada.
8. Admin menginput dana cair dari pembiayaan.
9. Admin menginput Refund.
10. Sistem menghitung total nilai penjualan kredit.
11. Sistem menghitung laba kendaraan.
12. Sistem menyimpan transaksi.
13. Status kendaraan menjadi SOLD.

**Outcome:** Transaksi kredit tercatat.

---

## Journey J-05 — Mencatat Operasional

**Actor:** Admin

**Trigger:** Terjadi biaya operasional perusahaan.

**Main flow:**

1. Admin membuka menu Operasional.
2. Admin memilih jenis transaksi.
3. Admin memasukkan tanggal.
4. Admin memasukkan nominal.
5. Admin mengupload bukti.
6. Admin menyimpan transaksi.
7. Sistem memasukkan transaksi ke rekap operasional.
8. Data digunakan dalam perhitungan keuntungan perusahaan.

**Alternative flow:**

* A1. Jika kategori Lainnya dipilih, admin wajib mengisi keterangan.

**Outcome:** Biaya operasional tercatat.

---

## Journey J-06 — Owner Melihat Laporan

**Actor:** Owner

**Trigger:** Owner ingin memonitor performa perusahaan.

**Preconditions:**

* Owner sudah login.

**Main flow:**

1. Owner membuka Dashboard.
2. Sistem menampilkan ringkasan kendaraan, penjualan, dan keuntungan.
3. Owner memilih rentang waktu.
4. Owner membuka laporan.
5. Owner dapat melakukan filter.
6. Owner dapat mengunduh laporan PDF atau Excel.

**Outcome:** Owner memperoleh informasi performa bisnis tanpa mengubah data operasional.

---

# 8. Functional Requirements

## Module: Authentication & Authorization

### FR-AUTH-001 — Login

* Description: Sistem wajib menyediakan autentikasi bagi pengguna internal.
* Actor: Admin, Owner
* Preconditions: Akun aktif.
* Input: Credential pengguna.
* Processing rules: Sistem memvalidasi credential dan role.
* Output: Session pengguna.
* Error behavior: Credential tidak valid menampilkan error.
* Priority: MUST
* Acceptance criteria:

  * Given akun valid, when pengguna login, then pengguna masuk ke aplikasi.
  * Given credential tidak valid, when login dilakukan, then akses ditolak.

### FR-AUTH-002 — Role-based Access

* Description: Menu dan aksi harus dibatasi berdasarkan role.
* Actor: Admin, Owner
* Priority: MUST
* Acceptance criteria:

  * Given Owner login, when membuka aplikasi, then Owner tidak mendapatkan fungsi edit data operasional.
  * Given Admin login, when membuka modul operasional, then fungsi pengelolaan tersedia.

---

# Module: Dashboard

### FR-DASH-001 — Dashboard Summary

* Description: Dashboard menampilkan ringkasan utama performa showroom.
* Actor: Admin, Owner
* Output:

  * total kendaraan,
  * grafik penjualan,
  * lima penjualan terbaru,
  * keuntungan,
  * ringkasan operasional.
* Priority: MUST
* Acceptance criteria:

  * Given data tersedia, when dashboard dibuka, then data ringkasan ditampilkan berdasarkan data tersimpan.

### FR-DASH-002 — Rekap Semua Penjualan

* Description: Pengguna dapat berpindah dari daftar lima penjualan terbaru menuju seluruh data penjualan.
* Actor: Admin, Owner
* Priority: MUST

---

# Module: Kendaraan

### FR-VEH-001 — Tambah Kendaraan

* Description: Admin dapat mencatat kendaraan baru.
* Actor: Admin
* Input:

  * tanggal pembelian,
  * merk,
  * tipe,
  * nomor polisi,
  * tahun,
  * warna,
  * foto,
  * harga penawaran.
* Priority: MUST

### FR-VEH-002 — Tipe Modal Kendaraan

* Description: Sistem menyediakan tipe UMUM dan KHUSUS.
* Actor: Admin
* Processing rules:

  * UMUM memiliki modal sepenuhnya dari showroom.
  * KHUSUS memiliki modal showroom dan modal kolaborator.
  * Maksimal satu kolaborator untuk satu kendaraan KHUSUS pada MVP.
* Priority: MUST

### FR-VEH-003 — Dokumen Kendaraan

* Description: Admin dapat mencatat STNK dan BPKB.
* Input:

  * status dokumen,
  * file/gambar,
  * keterangan.
* Priority: MUST

### FR-VEH-004 — Status Pajak

* Description: Admin dapat menentukan pajak ON/OFF dan mencatat biaya terkait.
* Priority: MUST

### FR-VEH-005 — Biaya Kendaraan

* Description: Admin dapat menambahkan biaya kendaraan.
* Input:

  * pajak,
  * Dico,
  * kelistrikan/kaki-kaki,
  * biaya lainnya.
* Processing rules:

  * Dico merupakan kategori perbaikan/pengecatan kendaraan.
  * Biaya lainnya dapat ditambahkan secara dinamis.
* Priority: MUST

### FR-VEH-006 — Perhitungan Modal Akhir

* Description: Sistem menghitung modal akhir kendaraan secara otomatis.
* Processing rules:

  * Total Modal Awal = Modal Showroom jika UMUM.
  * Total Modal Awal = Modal Showroom + Modal Kolaborator jika KHUSUS.
  * Modal Akhir = Total Modal Awal + Total Biaya Kendaraan.
* Priority: MUST

### FR-VEH-007 — Daftar Kendaraan

* Description: Kendaraan ditampilkan dalam format card menyerupai marketplace internal.
* Output minimal:

  * foto,
  * nomor polisi,
  * tahun,
  * harga penawaran,
  * status.
* Priority: MUST

### FR-VEH-008 — Edit Kendaraan

* Description: Admin dapat memperbarui data kendaraan.
* Priority: MUST

### FR-VEH-009 — Status Kendaraan

* Description: Sistem menyediakan status lifecycle kendaraan.
* Proposed statuses:

  * PREPARATION,
  * READY,
  * BOOKING,
  * SOLD.
* Priority: SHOULD
* Note: Daftar status final masih memerlukan konfirmasi bisnis.

### FR-VEH-010 — PDF Internal Kendaraan

* Description: Admin dapat menghasilkan PDF informasi internal kendaraan.
* Priority: MUST

---

# Module: Penjualan

### FR-SALE-001 — Form Terjual

* Description: Admin dapat memulai transaksi dari kendaraan yang tersedia.
* Actor: Admin
* Processing rules: Data kendaraan otomatis dibawa ke transaksi.
* Priority: MUST

### FR-SALE-002 — Data Pembeli

* Input:

  * nama,
  * nomor WhatsApp,
  * nomor WhatsApp alternatif,
  * alamat,
  * foto KTP.
* Processing rules:

  * Nama, nomor WhatsApp, alamat, dan KTP wajib.
* Priority: MUST

### FR-SALE-003 — Harga Terjual

* Description: Admin memasukkan harga transaksi aktual.
* Processing rules: Harga terjual tidak wajib sama dengan harga penawaran.
* Priority: MUST

### FR-SALE-004 — Penjualan CASH

* Processing rules:

  * Field kredit tidak ditampilkan.
  * CASH tidak memiliki DP Terutang.
  * Laba Kendaraan = Harga Terjual - Modal Akhir.
* Priority: MUST

### FR-SALE-005 — Penjualan KREDIT

* Input:

  * perusahaan pembiayaan,
  * DP,
  * DP Terutang,
  * dana cair pembiayaan,
  * Refund.
* Processing rules:

Total Nilai Penjualan Kredit:

`DP + DP Terutang + Cair dari Pembiayaan + Refund`

Laba kendaraan:

`Total Nilai Penjualan Kredit - Modal Akhir`

* Priority: MUST

### FR-SALE-006 — PIC

* Description: Admin memilih PIC dari data karyawan.
* Priority: MUST

### FR-SALE-007 — Area Penjualan

* Description: Setiap transaksi memiliki area.
* Priority: MUST

### FR-SALE-008 — Edit Transaksi

* Description: Admin dapat mengedit transaksi yang sudah disimpan, termasuk transaksi kendaraan SOLD.
* Priority: MUST

### FR-SALE-009 — Invoice Pelanggan

* Description: Sistem dapat membuat PDF pelanggan.
* Processing rules: Invoice tidak boleh menampilkan informasi internal seperti modal, biaya internal, atau laba.
* Priority: MUST

---

# Module: Operasional

### FR-OPS-001 — Input Operasional

* Input:

  * jenis transaksi,
  * tanggal,
  * nominal,
  * bukti.
* Priority: MUST

### FR-OPS-002 — Jenis Operasional Lainnya

* Description: Jika pengguna memilih Lainnya, sistem menampilkan input keterangan tambahan.
* Priority: MUST

### FR-OPS-003 — Pengaruh terhadap Keuntungan

* Description: Biaya operasional harus diperhitungkan dalam analisis keuntungan perusahaan.
* Priority: MUST
* Note: Perhitungan final keuntungan showroom untuk kendaraan KHUSUS bergantung pada formula pembagian laba kolaborator yang masih TBD.

---

# Module: Reporting

### FR-REP-001 — Rekap Penjualan

* Kolom minimal:

  * No.
  * Area.
  * PIC.
  * Jenis mobil.
  * No. Polisi.
  * Tahun.
  * UMUM/KHUSUS.
  * Tanggal Pembelian.
  * Status Bayar.
  * Harga Jual.
  * DP.
  * DP Terutang.
  * Modal Awal.
  * Total Service Tambahan.
  * Modal Akhir.
  * Laba Kendaraan.
* Priority: MUST

### FR-REP-002 — Search dan Filter

* Description: Pengguna dapat mencari dan memfilter data.
* Minimal filter:

  * tanggal.
* Proposed filters:

  * area,
  * PIC,
  * kendaraan,
  * status,
  * metode pembayaran.
* Priority: MUST

### FR-REP-003 — Export PDF

* Description: Data laporan dapat diekspor ke PDF.
* Priority: MUST

### FR-REP-004 — Export Excel

* Description: Data laporan dapat diekspor ke XLSX berdasarkan filter aktif.
* Priority: MUST

---

# Module: Master Data

### FR-MASTER-001 — Data Karyawan

* Description: Admin dapat mengelola karyawan yang digunakan sebagai PIC.
* Priority: MUST

### FR-MASTER-002 — Data Area

* Description: Admin dapat mengelola pilihan area.
* Initial values berdasarkan riset:

  * Bone,
  * Sinjai,
  * Bulukumba,
  * Pinrang.
* Priority: MUST

### FR-MASTER-003 — Perusahaan Pembiayaan

* Initial values:

  * Adira,
  * OTO,
  * SMS,
  * MUF.
* Processing rules: Nilai dikelola sebagai master data agar dapat dikembangkan tanpa perubahan source code.
* Priority: MUST

### FR-MASTER-004 — Dynamic Dropdown

* Description: Data dropdown tertentu dapat ditambah atau diedit melalui master data.
* Priority: SHOULD

---

# 9. Business Rules

* **BR-001:** Kendaraan UMUM menggunakan 100% modal showroom.
* **BR-002:** Kendaraan KHUSUS memiliki modal dari showroom dan satu kolaborator.
* **BR-003:** Satu kendaraan KHUSUS hanya memiliki maksimal satu kolaborator pada MVP.
* **BR-004:** Kolaborator kendaraan KHUSUS mendapatkan bagian keuntungan, tetapi formula pembagiannya masih TBD.
* **BR-005:** Modal Awal UMUM = Modal Showroom.
* **BR-006:** Modal Awal KHUSUS = Modal Showroom + Modal Kolaborator.
* **BR-007:** Modal Akhir = Modal Awal + seluruh biaya kendaraan.
* **BR-008:** Dico termasuk biaya perbaikan/pengecatan kendaraan.
* **BR-009:** Harga penawaran tidak harus sama dengan harga terjual.
* **BR-010:** Tanggal Pembelian Kendaraan dicatat pada saat kendaraan masuk/dibeli showroom.
* **BR-011:** CASH tidak memiliki DP Terutang.
* **BR-012:** Laba kendaraan CASH = Harga Terjual - Modal Akhir.
* **BR-013:** Total Nilai Penjualan Kredit = DP + DP Terutang + Cair Pembiayaan + Refund.
* **BR-014:** Laba kendaraan KREDIT = Total Nilai Penjualan Kredit - Modal Akhir.
* **BR-015:** Biaya operasional tidak ditambahkan ke Modal Akhir kendaraan.
* **BR-016:** Biaya operasional mempengaruhi keuntungan perusahaan.
* **BR-017:** STNK dan BPKB dikelola sebagai dua dokumen berbeda.
* **BR-018:** Transaksi terjual masih dapat diedit Admin pada MVP.
* **BR-019:** Owner memiliki fungsi utama monitoring dan laporan.
* **BR-020:** Informasi modal dan laba tidak boleh ditampilkan pada invoice pelanggan.
* **BR-021:** Kendaraan tidak boleh memiliki lebih dari satu transaksi penjualan aktif/final pada waktu yang sama.

---

# 10. Authorization Matrix

| Capability           |   Admin  | Owner |
| -------------------- | :------: | :---: |
| View Dashboard       |    Yes   |  Yes  |
| View Kendaraan       |    Yes   |  Yes  |
| Create Kendaraan     |    Yes   |   No  |
| Edit Kendaraan       |    Yes   |   No  |
| View Data Penjualan  |    Yes   |  Yes  |
| Create Penjualan     |    Yes   |   No  |
| Edit Penjualan       |    Yes   |   No  |
| View Operasional     |    Yes   |  Yes  |
| Create Operasional   |    Yes   |   No  |
| Edit Operasional     |    Yes   |   No  |
| View Laporan         |    Yes   |  Yes  |
| Export PDF           |    Yes   |  Yes  |
| Export Excel         |    Yes   |  Yes  |
| Manage Karyawan      |    Yes   |   No  |
| Manage Master Data   |    Yes   |   No  |
| View Data Customer   |    Yes   |  TBD  |
| Delete Data Keuangan | No / TBD |   No  |

**Data scope:**

* Admin dapat mengelola data operasional Mahaputra Group.
* Owner memiliki akses monitoring/read-only untuk MVP.
* Pembatasan data berdasarkan area belum ditetapkan.
* Transfer kendaraan antar-area masih membutuhkan konfirmasi.

---

# 11. Data Requirements

## 11.1 Core entities

| Entity             | Purpose                      | Key data                                                                     | Owner/scope |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------- | ----------- |
| User               | Akun aplikasi                | name, username/email, role                                                   | Internal    |
| Vehicle            | Data utama kendaraan         | purchase_date, brand, type, plate_number, year, color, status, selling_price | Mahaputra   |
| VehiclePhoto       | Foto kendaraan               | vehicle_id, file                                                             | Mahaputra   |
| VehicleDocument    | STNK/BPKB                    | type, status, file, note                                                     | Mahaputra   |
| VehicleCost        | Biaya kendaraan              | category, amount, date, note                                                 | Mahaputra   |
| Collaborator       | Pemilik modal eksternal      | name, capital                                                                | Mahaputra   |
| Customer           | Data pembeli                 | name, WhatsApp, address, KTP                                                 | Mahaputra   |
| Sale               | Transaksi                    | vehicle, customer, area, PIC, payment_type, selling_price                    | Mahaputra   |
| SalePayment        | Detail pembayaran kredit     | DP, outstanding_DP, financing_disbursement, refund                           | Mahaputra   |
| OperationalExpense | Biaya perusahaan             | type, date, amount, receipt                                                  | Mahaputra   |
| Employee           | Data PIC                     | name, status                                                                 | Mahaputra   |
| Area               | Master area                  | name                                                                         | Mahaputra   |
| FinancingProvider  | Perusahaan pembiayaan        | name                                                                         | Mahaputra   |
| MasterData         | Dropdown yang dapat dikelola | type, value, status                                                          | Mahaputra   |

## 11.2 Data lifecycle

* **Creation:** Dibuat Admin saat aktivitas operasional terjadi.
* **Updates:** Admin dapat melakukan perubahan pada MVP.
* **Retention:** TBD. Tidak ada penghapusan otomatis pada MVP.
* **Deletion:** Hard delete data transaksi keuangan tidak direkomendasikan. Mekanisme final TBD.
* **Audit:** Minimal sistem menyimpan created_at, updated_at, dan user yang melakukan perubahan jika memungkinkan.
* **Export/import:**

  * Export PDF.
  * Export XLSX.
  * Import massal belum termasuk MVP.

## 11.3 Data quality rules

* Nomor polisi wajib untuk kendaraan.
* Nomor polisi sebaiknya unik untuk kendaraan aktif.
* Tanggal pembelian wajib.
* Tahun kendaraan harus berupa tahun valid.
* Nominal uang tidak boleh negatif kecuali business rule tertentu secara eksplisit memperbolehkan.
* Kendaraan KHUSUS wajib memiliki kolaborator.
* Kendaraan UMUM tidak membutuhkan kolaborator.
* CASH tidak boleh menyimpan field kredit.
* KREDIT wajib memiliki perusahaan pembiayaan.
* Kendaraan SOLD tidak boleh dijual kembali tanpa proses koreksi transaksi.
* Customer wajib memiliki nama, WhatsApp, alamat, dan KTP sesuai requirement saat ini.
* File upload harus memiliki format dan ukuran yang diperbolehkan sistem.

---

# 12. Non-Functional Requirements

Bagian berikut merupakan **proposed technical target** dan perlu divalidasi bersama development team.

## 12.1 Performance

* Halaman utama sebaiknya dapat digunakan dalam ≤ 3 detik pada koneksi normal.
* Search dan filter data sebaiknya memberikan hasil ≤ 2 detik untuk volume data operasional normal.
* Proses penyimpanan transaksi harus memberikan feedback visual.
* Upload file tidak boleh memblokir UI tanpa indikator proses.

## 12.2 Availability and reliability

* Sistem harus mencegah kehilangan data saat transaksi berhasil disimpan.
* Database harus memiliki mekanisme backup berkala.
* Backup frequency dan retention: TBD.
* Kesalahan generate PDF/XLSX tidak boleh menghapus transaksi asli.

## 12.3 Security and privacy

* Authentication wajib.
* Authorization berbasis role.
* Password tidak disimpan dalam plain text.
* Data KTP pelanggan dikategorikan sebagai data sensitif.
* Dokumen kendaraan dikategorikan sebagai data internal.
* Data customer tidak boleh dapat diakses pengguna yang tidak berwenang.
* File upload harus divalidasi.
* URL file sensitif tidak boleh bersifat public tanpa kontrol akses.
* Aktivitas perubahan transaksi keuangan sebaiknya dapat diaudit.

## 12.4 Accessibility

Proposed minimum:

* Kontras teks memadai.
* Form memiliki label.
* Error tidak hanya dibedakan berdasarkan warna.
* Navigasi utama dapat digunakan dengan keyboard.
* Elemen tombol memiliki state disabled/loading.

## 12.5 Compatibility

* Browsers:

  * Google Chrome versi modern.
  * Microsoft Edge versi modern.
  * Browser Chromium modern lainnya.
* Devices:

  * Desktop/laptop sebagai prioritas utama.
  * Tablet dan mobile untuk monitoring/basic access.
* Minimum viewport:

  * Proposed: 360px.
* Connectivity assumptions:

  * Online.
  * Offline mode tidak termasuk MVP.

## 12.6 Localization

* Language: Bahasa Indonesia.
* Currency: Rupiah Indonesia (`Rp`).
* Number format: `Rp150.000.000`.
* Date format: `DD/MM/YYYY` atau format Indonesia yang disepakati UI.
* Timezone: Asia/Makassar / WITA untuk aktivitas operasional yang relevan.

---

# 13. UX Requirements

* Design reference: `docs/UI_SPEC.md`
* Figma: TBD
* Required states:

  * loading,
  * empty,
  * error,
  * disabled,
  * success,
  * unauthorized.
* Critical responsive flows:

  * Login.
  * Dashboard Owner.
  * Daftar Kendaraan.
  * Detail Kendaraan.
  * Form Kendaraan.
  * Form Terjual.
  * Rekap Penjualan.
  * Reporting.
* Confirmation required for:

  * perubahan penting pada transaksi SOLD,
  * penghapusan/arsip data,
  * perubahan data finansial,
  * aksi yang berpotensi mengubah status kendaraan.
* Form harus menggunakan conditional fields sehingga field UMUM/KHUSUS dan CASH/KREDIT hanya muncul ketika relevan.
* Nilai perhitungan otomatis harus dapat terlihat pengguna sebelum transaksi disimpan.
* Data yang sudah tersedia dari kendaraan tidak boleh diminta diinput ulang ketika proses penjualan.

---

# 14. Notifications and Communication

Tidak terdapat kebutuhan notifikasi eksternal yang dikonfirmasi untuk MVP.

| Event                     | Recipient   | Channel | Content/goal           |
| ------------------------- | ----------- | ------- | ---------------------- |
| Data berhasil disimpan    | Admin       | In-app  | Konfirmasi penyimpanan |
| Data gagal disimpan       | Admin       | In-app  | Menjelaskan kegagalan  |
| Export selesai/gagal      | Admin/Owner | In-app  | Status proses export   |
| Transaksi berhasil dibuat | Admin       | In-app  | Konfirmasi transaksi   |

Email dan WhatsApp notification berada di luar scope MVP.

---

# 15. Reporting and Analytics

## Reports required

* Rekap penjualan.
* Rekap operasional.
* Laporan kendaraan.
* PDF internal kendaraan.
* Invoice pelanggan.
* Ringkasan keuntungan kendaraan.
* Ringkasan keuntungan perusahaan.
* Dashboard grafik penjualan.
* Dashboard grafik keuntungan.

## Filters

Minimal:

* Tanggal.

Proposed:

* Area.
* PIC.
* Merk.
* Status kendaraan.
* UMUM/KHUSUS.
* CASH/KREDIT.
* Perusahaan pembiayaan.

## Export formats

* PDF.
* XLSX.

## Product events to track

Proposed:

* vehicle_created,
* vehicle_updated,
* vehicle_sold,
* sale_updated,
* operational_expense_created,
* report_exported.

## Sensitive data that must not be tracked in analytics

* Foto KTP.
* Nomor identitas KTP.
* File STNK.
* File BPKB.
* Data credential.
* Isi dokumen sensitif pelanggan.

---

# 16. Edge Cases

* Tidak ada kendaraan pada dashboard.
* Tidak ada transaksi pada periode filter.
* Nomor polisi kendaraan sudah digunakan.
* Pengguna menekan Submit dua kali.
* Koneksi terputus saat menyimpan.
* Upload foto/dokumen gagal.
* File melebihi batas ukuran.
* Format file tidak diperbolehkan.
* Dua Admin mengedit data yang sama.
* Kendaraan sudah SOLD tetapi tombol Terjual kembali diakses.
* Kendaraan UMUM tidak memiliki kolaborator.
* Modal kolaborator kosong.
* CASH masih memiliki nilai dari field kredit akibat data lama.
* Transaksi KREDIT tidak memiliki pembiayaan.
* DP Terutang bernilai kosong/0.
* Total biaya kendaraan berubah setelah transaksi dijual.
* Harga penawaran berbeda jauh dengan harga terjual.
* Nilai nominal 0.
* Data pelanggan duplikat.
* PIC tidak aktif tetapi terdapat pada transaksi lama.
* Master data dihapus tetapi digunakan transaksi historis.
* User kehilangan hak akses saat sedang menggunakan aplikasi.
* Generate PDF gagal.
* Generate XLSX gagal.
* Rentang tanggal tidak valid.
* Pembulatan nilai Rupiah.
* Perubahan timezone/tanggal di browser pengguna.

---

# 17. Dependencies and Integrations

| Dependency            | Purpose                                | Owner    | Risk/fallback              |
| --------------------- | -------------------------------------- | -------- | -------------------------- |
| Database              | Menyimpan data aplikasi                | Dev Team | Backup dan recovery        |
| File storage          | Foto kendaraan, KTP, STNK, BPKB, bukti | Dev Team | Validasi + backup          |
| PDF Generator         | Invoice dan laporan                    | Dev Team | Retry/manual export        |
| XLSX Generator        | Rekap Excel                            | Dev Team | Retry/manual export        |
| Authentication System | Login dan role                         | Dev Team | Session handling           |
| Hosting/Server        | Menjalankan aplikasi                   | TBD      | Backup/deployment fallback |

Tidak ada third-party integration yang wajib pada MVP berdasarkan hasil diskusi saat ini.

---

# 18. Risks and Mitigations

| Risk                                       | Probability | Impact | Mitigation                                         | Owner         |
| ------------------------------------------ | ----------- | ------ | -------------------------------------------------- | ------------- |
| Formula bisnis berubah setelah development | M           | H      | Business rules dikonfirmasi sebelum implementasi   | Product       |
| Pembagian laba kolaborator belum jelas     | H           | H      | Jadikan Open Question sebelum fitur profit sharing | Product/Owner |
| Data keuangan salah akibat input           | M           | H      | Validation + calculated fields                     | Product/Dev   |
| Perubahan transaksi SOLD tanpa histori     | M           | H      | Confirmation + audit trail minimum                 | Dev           |
| File KTP/dokumen bocor                     | L/M         | H      | Private storage + authorization                    | Dev           |
| Master data berubah dan merusak histori    | M           | M      | Gunakan inactive/archive, bukan hard delete        | Dev           |
| Kendaraan terjual dua kali                 | L           | H      | Validasi status transaksi                          | Dev           |
| Requirement transfer area belum pasti      | M           | M      | Tidak finalisasi sebelum konfirmasi                | Product       |
| User kesulitan menggunakan form panjang    | M           | M      | Conditional form + usability testing               | UI/UX         |
| Upload gambar besar memperlambat sistem    | M           | M      | Compression dan size limit                         | Dev           |

---

# 19. Release Plan

## Phase 1 — Foundation & Vehicle Management

* Scope:

  * Authentication.
  * Roles.
  * Master Data.
  * Vehicle CRUD.
  * Dokumen.
  * Biaya kendaraan.
  * UMUM/KHUSUS.
  * Perhitungan modal.
* Entry criteria:

  * PRD utama disetujui.
  * Business rule kendaraan dikonfirmasi.
* Exit criteria:

  * Admin dapat mencatat kendaraan dari awal sampai siap dijual.
  * Modal akhir dihitung benar.

## Phase 2 — Sales & Operational

* Scope:

  * Form Terjual.
  * Customer.
  * CASH.
  * KREDIT.
  * PIC.
  * Invoice.
  * Operasional.
* Entry criteria:

  * Vehicle module stabil.
* Exit criteria:

  * Skenario cash dan kredit lulus functional testing.
  * Biaya operasional tercatat.

## Phase 3 — Dashboard, Reporting & UAT

* Scope:

  * Dashboard.
  * Grafik.
  * Rekap.
  * PDF.
  * XLSX.
  * Owner access.
* Entry criteria:

  * Data transaksi tersedia.
* Exit criteria:

  * Semua critical journeys lulus UAT.
  * Owner dapat membaca laporan.
  * Export bekerja.

## Rollback/fallback

Jika rilis bermasalah:

* Deployment dikembalikan ke versi aplikasi stabil sebelumnya.
* Database tidak boleh dihapus.
* Migration database wajib memiliki prosedur rollback atau recovery.
* Backup dilakukan sebelum deployment penting.
* Jika modul laporan gagal, data operasional tetap harus dapat diakses dan tidak boleh hilang.

---

# 20. Overall Acceptance Criteria

* [ ] Semua requirement prioritas MUST selesai.
* [ ] Admin dapat menambahkan kendaraan baru.
* [ ] UMUM dan KHUSUS mengikuti business rules.
* [ ] Modal Akhir dihitung otomatis dan benar.
* [ ] Admin dapat menambahkan biaya kendaraan.
* [ ] Admin dapat memproses transaksi CASH.
* [ ] CASH tidak memiliki DP Terutang.
* [ ] Admin dapat memproses transaksi KREDIT.
* [ ] Formula transaksi kredit sesuai business rules.
* [ ] Kendaraan yang terjual memiliki status SOLD.
* [ ] Data customer tersimpan.
* [ ] Invoice customer tidak memuat data internal.
* [ ] PDF internal tersedia.
* [ ] Biaya operasional tercatat.
* [ ] Dashboard Owner berfungsi.
* [ ] Rekap penjualan tersedia.
* [ ] Export PDF berfungsi.
* [ ] Export XLSX berfungsi.
* [ ] Role dan batas akses telah diuji.
* [ ] Alur utama berhasil pada desktop dan responsive view yang disepakati.
* [ ] Error dan empty state tersedia.
* [ ] Data yang dihasilkan sesuai business rules.
* [ ] Tidak ada blocker keamanan atau kehilangan data.
* [ ] Dokumentasi pengguna/teknis yang diperlukan tersedia.

---

# 21. Open Questions

| ID     | Question                                                                               | Owner                | Due date | Decision/status   |
| ------ | -------------------------------------------------------------------------------------- | -------------------- | -------- | ----------------- |
| OQ-001 | Bagaimana formula pembagian laba antara showroom dan kolaborator untuk kendaraan KHUSUS? | Owner/Product        | TBD      | OPEN              |
| OQ-002 | Apakah pembagian berdasarkan proporsi modal atau persentase kesepakatan?               | Owner/Product        | TBD      | OPEN              |
| OQ-003 | Apakah kendaraan dapat berpindah Area secara resmi?                                    | Business Stakeholder | TBD      | NEED CONFIRMATION |
| OQ-004 | Jika kendaraan berpindah Area, apakah perlu menyimpan histori perpindahan?             | Product              | TBD      | OPEN              |
| OQ-005 | Apakah status PREPARATION, READY, BOOKING, SOLD sesuai proses bisnis aktual?           | Admin/Product        | TBD      | PROPOSED          |
| OQ-006 | Kapan transaksi kredit dianggap lunas/belum lunas?                                     | Admin/Owner          | TBD      | OPEN              |
| OQ-007 | Apakah DP Terutang perlu memiliki status, tanggal jatuh tempo, dan riwayat pelunasan?  | Admin/Owner          | TBD      | OPEN              |
| OQ-008 | Apakah Owner diperbolehkan melihat data pribadi pelanggan/KTP?                         | Owner/Product        | TBD      | OPEN              |
| OQ-009 | Apakah Admin boleh menghapus data atau hanya edit/archive?                             | Owner/Product        | TBD      | OPEN              |
| OQ-010 | Berapa batas ukuran dan format upload foto/dokumen?                                    | Dev/Product          | TBD      | OPEN              |
| OQ-011 | Field apa saja yang final untuk PDF internal dan invoice customer?                     | Admin/Product        | TBD      | OPEN              |
| OQ-012 | Apakah transaksi yang sudah SOLD membutuhkan approval saat diedit?                     | Owner/Product        | TBD      | FUTURE/OPEN       |
| OQ-013 | Apakah satu user Admin dapat mengakses seluruh Area atau dibatasi per Area?            | Owner/Product        | TBD      | OPEN              |
| OQ-014 | Bagaimana definisi final Keuntungan Perusahaan setelah pembagian laba kendaraan KHUSUS? | Owner/Product        | TBD      | OPEN              |

---

# 22. Decision Log

| Date       | Decision                                                 | Reason                         | Decision maker       |
| ---------- | -------------------------------------------------------- | ------------------------------ | -------------------- |
| 2026-08-10 | UMUM menggunakan 100% modal showroom                     | Koreksi proses bisnis          | Business Stakeholder |
| 2026-08-10 | KHUSUS memiliki modal showroom + kolaborator             | Koreksi proses bisnis          | Business Stakeholder |
| 2026-08-07 | Maksimal satu kolaborator per kendaraan untuk versi awal | Menyederhanakan kebutuhan awal | Business Stakeholder |
| 2026-08-07 | Dokumen kendaraan terdiri dari STNK dan BPKB             | Koreksi hasil riset awal       | Business Stakeholder |
| 2026-08-07 | Dico dikategorikan sebagai biaya perbaikan/pewarnaan     | Sesuai terminologi operasional | Business Stakeholder |
| 2026-08-07 | Harga penawaran dapat berbeda dari harga terjual         | Terdapat proses negosiasi      | Business Stakeholder |
| 2026-08-07 | Tanggal pembelian diinput saat kendaraan masuk showroom  | Sesuai alur kendaraan          | Business Stakeholder |
| 2026-08-07 | CASH tidak memiliki DP Terutang                          | Klarifikasi payment flow       | Business Stakeholder |
| 2026-08-07 | Biaya operasional mempengaruhi keuntungan perusahaan     | Sesuai perhitungan bisnis      | Business Stakeholder |
| 2026-08-10 | Kolaborator mendapatkan bagian keuntungan                | Sesuai skema kendaraan KHUSUS  | Business Stakeholder |
| 2026-08-07 | Transaksi SOLD masih dapat diedit untuk MVP              | Kebutuhan operasional awal     | Business Stakeholder |
| 2026-08-07 | Owner fokus pada dashboard dan laporan                   | Pembagian role                 | Business Stakeholder |
| 2026-08-07 | Sistem membutuhkan PDF pelanggan dan internal            | Perbedaan kebutuhan informasi  | Business Stakeholder |
| 2026-08-07 | Sistem mendukung export Excel                            | Kebutuhan rekap                | Business Stakeholder |

---

# 23. Change Log

| Version | Date       | Change                                                               | Author                 |
| ------- | ---------- | -------------------------------------------------------------------- | ---------------------- |
| 0.1     | 2026-08-07 | Initial PRD berdasarkan hasil riset dan klarifikasi business process | IT Product Development |
