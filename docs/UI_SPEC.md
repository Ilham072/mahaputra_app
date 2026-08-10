# UI Specification — Mahaputra Apps

## 1. Document Information

* Status: DRAFT
* Owner: IT Product Development / UI/UX
* Version: 0.1
* Last updated: 2026-08-07
* Figma: TBD
* Product requirements: `docs/PRD.md`
* Architecture: `docs/ARCHITECTURE.md`

---

# 2. Product UI Summary

* Product type: Internal Admin Dashboard
* Primary audience:

  * Admin Showroom
  * Owner Showroom
* Primary devices:

  * Desktop/Laptop — Primary
  * Tablet — Supported
  * Mobile — Supported for monitoring and basic actions
* Connectivity context: Normal internet connection
* Visual direction:

  * Professional
  * Clean
  * Bold
  * Automotive
  * Data-focused

Mahaputra Apps menggunakan identitas visual utama **hitam dan kuning**.

Namun penggunaan warna tidak boleh menyebabkan dashboard terlalu gelap atau sulit dibaca.

Strategi visual:

* Hitam digunakan untuk:

  * sidebar,
  * navigation,
  * heading tertentu,
  * primary text,
  * strong visual identity.

* Kuning digunakan untuk:

  * primary action,
  * active navigation,
  * selected state,
  * highlight,
  * focus state,
  * data emphasis tertentu.

* Putih dan neutral gray digunakan sebagai surface utama agar tabel, form, dan laporan tetap nyaman dibaca.

---

# 3. Design Principles

### DP-01 — Clarity Over Decoration

Dashboard harus mengutamakan keterbacaan data dibanding elemen dekoratif.

Penerapan:

* Hindari background dekoratif berlebihan.
* Hindari gradient tanpa fungsi.
* Gunakan ruang kosong secara cukup.
* Informasi finansial harus mudah dipindai.
* Primary action harus mudah ditemukan.

---

### DP-02 — Consistency

Komponen yang memiliki fungsi sama harus memiliki tampilan dan perilaku yang sama pada seluruh aplikasi.

Contoh:

* Semua tombol Simpan menggunakan Primary Button.
* Semua destructive action menggunakan Danger Button.
* Semua nominal uang menggunakan format Rupiah yang sama.
* Semua status kendaraan menggunakan Status Badge yang sama.

---

### DP-03 — Progressive Disclosure

Field hanya ditampilkan ketika diperlukan.

Contoh:

Jika:

`Jenis Modal = UMUM`

maka tampil:

* Kolaborator.
* Modal Showroom.
* Modal Kolaborator.

Jika:

`Jenis Modal = KHUSUS`

maka kolaborator disembunyikan.

Jika:

`Pembayaran = KREDIT`

maka tampil:

* Perusahaan pembiayaan.
* DP.
* DP Terutang.
* Cair pembiayaan.
* Refund.

Jika:

`Pembayaran = CASH`

seluruh field kredit disembunyikan.

---

### DP-04 — Safe Financial Actions

Aksi yang berpengaruh pada:

* transaksi,
* laba,
* status SOLD,
* biaya,
* modal,

harus memiliki feedback dan protection yang jelas.

Contoh:

* Confirmation sebelum perubahan penting.
* Loading state.
* Duplicate submit prevention.
* Success notification.
* Error message yang jelas.

---

### DP-05 — Desktop First, Responsive Always

Aktivitas Admin kemungkinan besar menggunakan desktop/laptop sehingga desktop menjadi prioritas utama.

Mobile tetap harus dapat digunakan untuk:

* Dashboard.
* Melihat kendaraan.
* Melihat transaksi.
* Melihat laporan.

Long financial forms tidak harus dipaksakan menjadi pengalaman mobile utama.

---

### DP-06 — Financial Information Must Be Scannable

Nominal uang harus mudah dibandingkan.

Penerapan:

* Gunakan tabular numbers bila tersedia.
* Angka pada tabel rata kanan.
* Label dan nilai dipisahkan dengan jelas.
* Laba positif/negatif memiliki visual state tetapi tidak hanya mengandalkan warna.

---

# 4. Design Tokens

Semua komponen harus menggunakan design token.

Hindari penggunaan arbitrary value jika token yang sesuai telah tersedia.

## 4.1 Colors

### Brand Colors

| Token                    | Value     | Usage                  |
| ------------------------ | --------- | ---------------------- |
| `color-primary-400`      | `#FACC15` | Highlight              |
| `color-primary-500`      | `#EAB308` | Primary action         |
| `color-primary-600`      | `#CA8A04` | Hover/pressed          |
| `color-brand-black`      | `#111111` | Sidebar / brand        |
| `color-brand-black-soft` | `#1C1C1C` | Secondary dark surface |

### Semantic Colors

| Token               | Value     | Usage               |
| ------------------- | --------- | ------------------- |
| `color-success-500` | `#16A34A` | Success / positive  |
| `color-warning-500` | `#F59E0B` | Warning             |
| `color-danger-500`  | `#DC2626` | Error/destructive   |
| `color-info-500`    | `#2563EB` | Informational state |

### Neutral Colors

| Token               | Value     | Usage                 |
| ------------------- | --------- | --------------------- |
| `color-neutral-950` | `#0A0A0A` | Strongest text        |
| `color-neutral-900` | `#171717` | Primary text          |
| `color-neutral-700` | `#404040` | Secondary strong text |
| `color-neutral-600` | `#525252` | Secondary text        |
| `color-neutral-500` | `#737373` | Muted text            |
| `color-neutral-300` | `#D4D4D4` | Strong border         |
| `color-neutral-200` | `#E5E5E5` | Border/divider        |
| `color-neutral-100` | `#F5F5F5` | Secondary background  |
| `color-neutral-50`  | `#FAFAFA` | App background        |
| `color-surface`     | `#FFFFFF` | Card/form/table       |

### Primary Button Rule

Primary yellow button:

```text
Background : #EAB308
Text       : #111111
Hover      : #CA8A04
```

Jangan menggunakan teks putih pada warna kuning terang jika contrast tidak memenuhi target.

### Brand Rule

Kuning bukan warna teks body.

Hindari:

```text
Yellow text on white
```

Gunakan kuning terutama sebagai:

* background button,
* selected marker,
* active navigation,
* icon accent,
* small highlight.

### Dark Surface Rule

Jika background hitam:

```text
Primary text   : White
Secondary text : Neutral-300
Active accent  : Yellow
```

---

# 4.2 Typography

Recommended font:

**Inter**

Fallback:

```text
Inter, ui-sans-serif, system-ui, sans-serif
```

Alasan:

* Sangat readable.
* Bagus untuk dashboard.
* Angka mudah dibaca.
* Cocok untuk React/Tailwind dashboard.

| Token/style | Font  | Size / Line | Weight | Usage                   |
| ----------- | ----- | ----------- | ------ | ----------------------- |
| Display     | Inter | 32 / 40     | 700    | Large dashboard heading |
| H1          | Inter | 28 / 36     | 700    | Page title              |
| H2          | Inter | 22 / 30     | 600    | Section title           |
| H3          | Inter | 18 / 28     | 600    | Card section            |
| Body        | Inter | 14 / 22     | 400    | Main content            |
| Body Large  | Inter | 16 / 24     | 400    | Important content       |
| Small       | Inter | 12 / 18     | 400    | Supporting content      |
| Label       | Inter | 14 / 20     | 500    | Form label              |
| KPI         | Inter | 28 / 34     | 700    | Dashboard metrics       |

Financial numbers should use:

```css
font-variant-numeric: tabular-nums;
```

where possible.

---

# 4.3 Spacing

Base unit:

```text
4px
```

| Token      | Value | Typical use           |
| ---------- | ----: | --------------------- |
| `space-1`  |   4px | Tight icon gap        |
| `space-2`  |   8px | Compact gap           |
| `space-3`  |  12px | Control gap           |
| `space-4`  |  16px | Standard gap          |
| `space-5`  |  20px | Card internal spacing |
| `space-6`  |  24px | Card padding          |
| `space-8`  |  32px | Section spacing       |
| `space-10` |  40px | Large section         |

---

# 4.4 Radius, Border, and Shadow

Mahaputra Apps sebaiknya tidak menggunakan radius terlalu besar agar mempertahankan karakter profesional/automotive.

| Token            | Value               | Usage              |
| ---------------- | ------------------- | ------------------ |
| `radius-sm`      | 6px                 | Small input/badge  |
| `radius-md`      | 10px                | Button/input/card  |
| `radius-lg`      | 14px                | Large card/modal   |
| `border-default` | `1px solid #E5E5E5` | Default border     |
| `shadow-sm`      | subtle              | Card/dropdown      |
| `shadow-md`      | medium              | Floating component |
| `shadow-lg`      | stronger            | Modal              |

Cards utama sebaiknya menggunakan:

```text
White background
1px border
Subtle shadow
```

bukan heavy shadow.

---

# 4.5 Iconography

Recommended:

**Lucide Icons**

Default sizes:

* 16px — inline.
* 20px — normal button/navigation.
* 24px — large action/KPI.

Default stroke:

```text
1.75–2px
```

Rules:

* Icon tidak boleh menggantikan label penting.
* Icon-only button wajib memiliki tooltip.
* Action finansial/destructive harus menggunakan icon + label jika memungkinkan.

---

# 5. Breakpoints and Target Viewports

| Name    |     Width | Usage                |
| ------- | --------: | -------------------- |
| Mobile  |   360–767 | Single column        |
| Tablet  |  768–1023 | Adaptive layout      |
| Desktop | 1024–1439 | Main admin interface |
| Wide    |     1440+ | Expanded dashboard   |

Verification widths:

* 360px
* 768px
* 1280px
* 1440px

Primary design width:

```text
1440px
```

karena sistem digunakan sebagai internal dashboard.

---

# 6. Global Layout

## 6.1 Container

Maximum content width:

```text
1600px
```

Desktop:

```text
padding-inline: 24–32px
```

Mobile:

```text
padding-inline: 16px
```

Section vertical spacing:

```text
24–32px
```

---

# 6.2 Application Shell

## Desktop

### Sidebar

Expanded:

```text
256px
```

Collapsed:

```text
72px
```

Background:

```text
#111111
```

Logo:

```text
Mahaputra Group
```

Active navigation:

```text
Background : Yellow
Text       : Black
Icon       : Black
```

Normal navigation:

```text
Text : Neutral-300
Icon : Neutral-400
```

Hover:

```text
Dark gray background
White text
```

### Header

Height:

```text
64px
```

Contents:

* Optional breadcrumb/page context.
* User name.
* User role.
* User menu/logout.

Header background:

```text
White
```

with subtle bottom border.

### Main Content

Background:

```text
#FAFAFA
```

---

## Mobile

Sidebar berubah menjadi:

```text
Drawer
```

Trigger:

```text
Hamburger button
```

Drawer memiliki dark Mahaputra sidebar design.

---

# 6.3 Grid

Desktop dashboard:

```text
12-column grid
```

Gutter:

```text
24px
```

KPI cards:

Desktop:

```text
4 cards / row
```

Tablet:

```text
2 cards / row
```

Mobile:

```text
1 card / row
```

---

# 7. Navigation

Recommended main navigation:

```text
Dashboard

Kendaraan
├── Data Kendaraan
└── Tambah Kendaraan

Penjualan
└── Rekap Penjualan

Operasional

Laporan

Master Data
├── Karyawan
├── Area
├── Merk Kendaraan
├── Pembiayaan
└── Kategori Operasional
```

Owner navigation should hide management functions that cannot be used.

Recommended Owner navigation:

```text
Dashboard
Kendaraan
Penjualan
Operasional
Laporan
```

## Desktop

Navigation:

```text
Left Sidebar
```

Rules:

* Active menu clearly highlighted.
* Menu group may collapse.
* Sidebar may collapse to icons on desktop.

## Mobile

* Hamburger opens drawer.
* Drawer closes after navigation.
* ESC closes on desktop keyboard.
* Backdrop tap closes drawer.
* Focus must remain inside drawer while open.

## Breadcrumbs

Use on:

* Detail Kendaraan.
* Edit Kendaraan.
* Detail Penjualan.
* Nested Master Data.

Example:

```text
Kendaraan / Toyota Avanza DD 1234 XX
```

Do not use on:

* Dashboard.
* Main index/list pages.

---

# 8. Component Specifications

## 8.1 Button

Variants:

### Primary

Yellow background + black text.

Used for:

* Tambah Kendaraan.
* Simpan.
* Proses Penjualan.
* Unduh utama.

### Secondary

Dark background + white text.

### Outline

White background + gray/black border.

### Ghost

No strong background.

Used for:

* Secondary navigation action.

### Danger

Red background.

Used for:

* Delete/archive/destructive actions.

Sizes:

* SM: 32px.
* MD: 40px.
* LG: 44px.

Primary action rule:

**Maksimal satu visually dominant primary button pada satu action area.**

Example:

```text
[ Batal ] [ Simpan Kendaraan ]
```

Simpan menggunakan yellow primary.

---

# 8.2 Form Controls

Components:

* Input.
* Currency input.
* Date picker.
* Select.
* Searchable select.
* Textarea.
* Checkbox.
* Radio.
* Switch.
* Upload control.

Label position:

```text
Above field
```

Do not use floating label.

Required field:

```text
Nama Pembeli *
```

Help text digunakan apabila format tidak obvious.

Currency field display:

```text
Rp 150.000.000
```

Store value:

```text
150000000
```

Disabled field:

* muted background,
* not editable.

Read-only calculated field:

* distinguish from disabled input,
* show calculator/lock indicator if useful.

Example:

```text
Modal Akhir
Rp 125.000.000
Dihitung otomatis
```

---

# 8.3 Form Sections

Long forms harus dibagi menjadi section card.

Example Vehicle Form:

```text
Informasi Kendaraan
↓
Dokumen & Pajak
↓
Sumber Modal
↓
Biaya Kendaraan
↓
Harga & Status
```

Jangan membuat satu card besar berisi seluruh input.

---

# 8.4 Card

Variants:

* Standard.
* KPI.
* Interactive.
* Vehicle.
* Financial Summary.
* Alert.

Standard padding:

```text
24px desktop
16px mobile
```

---

## Vehicle Card

Contents:

```text
Vehicle photo

Toyota Avanza
DD 1234 XX

2022 • Hitam

READY

Rp 168.000.000
```

Actions:

```text
Detail
Edit
Terjual
```

`Terjual` hanya muncul jika status kendaraan memungkinkan.

Harga menggunakan visual emphasis paling kuat setelah nama kendaraan.

---

# 8.5 KPI Card

Recommended dashboard cards:

### Total Kendaraan

Icon + number.

### Kendaraan Ready

Icon + number.

### Penjualan

Jumlah transaksi dalam periode aktif.

### Laba Kendaraan

Formatted Rupiah.

### Operasional

Formatted Rupiah.

### Keuntungan Perusahaan

Jika formula sudah final.

KPI card tidak menggunakan full yellow background semuanya.

Recommended:

```text
White card
Black text
Yellow icon container/accent
```

---

# 8.6 Modal / Dialog

Use for:

* Confirmation.
* Short edit.
* Delete/archive confirmation.
* Confirmation SOLD.
* Short master-data form.

Do not use for:

* Tambah kendaraan.
* Form penjualan.
* Long customer forms.

Long flow menggunakan full page.

Mobile modal:

```text
Fullscreen / near-fullscreen
```

---

# 8.7 Toast / Alert

Toast:

* Data berhasil disimpan.
* Export selesai.
* Perubahan sederhana berhasil.

Duration:

```text
4–5 seconds
```

Error yang membutuhkan aksi:

```text
Inline alert
```

Tidak auto-dismiss.

Example:

```text
Transaksi tidak dapat disimpan.
Kendaraan ini sudah berstatus Terjual.
```

---

# 8.8 Table / Data Grid

Header:

```text
Sticky where useful
```

Table container dapat scroll horizontal pada mobile.

Numeric columns:

```text
Right aligned
```

Text:

```text
Left aligned
```

Actions:

```text
Dropdown menu "..."
```

untuk tabel dengan banyak aksi.

Primary table actions seperti `Detail` dapat tetap terlihat.

Pagination:

```text
25
50
100
```

Default:

```text
25
```

Empty:

```text
Belum ada transaksi penjualan.

Transaksi akan muncul setelah kendaraan berhasil dijual.
```

---

# 8.9 Status Badge

## Vehicle

| Status      | Label     | Color token         | Meaning                    |
| ----------- | --------- | ------------------- | -------------------------- |
| PREPARATION | Persiapan | `color-warning-500` | Kendaraan sedang disiapkan |
| READY       | Ready     | `color-success-500` | Siap dijual                |
| BOOKING     | Booking   | `color-info-500`    | Dalam proses calon pembeli |
| SOLD        | Terjual   | `color-neutral-700` | Penjualan selesai          |

Status final mengikuti keputusan PRD.

Badge harus memiliki:

```text
Color + Text
```

bukan warna saja.

---

## Capital Type

### UMUM

Badge:

```text
UMUM
```

Gunakan neutral/info styling.

### KHUSUS

Badge:

```text
KHUSUS
```

Gunakan yellow-accent styling.

Jangan menggunakan hijau/merah karena bukan status positif/negatif.

---

## Payment

### CASH

```text
Cash
```

### CREDIT

```text
Kredit
```

gunakan badge yang berbeda tetapi tetap ada text label.

---

# 9. Page Specifications

# Page: Login

* Route: `/login`
* Primary user: Admin, Owner
* Page goal: Login ke Mahaputra Apps.
* Required permission: Guest

## Structure

Desktop:

```text
┌─────────────────────────────┐
│                             │
│     Mahaputra Branding      │
│                             │
│             Login Card      │
│             Email/User      │
│             Password        │
│             Login           │
│                             │
└─────────────────────────────┘
```

Visual:

* Background black/dark.
* Yellow accent.
* Login card white.

Avoid large automotive stock image unless brand assets exist.

---

# Page: Dashboard

* Route: `/dashboard`
* Related requirement: FR-DASH-001
* Primary user: Admin, Owner
* Page goal: Memberikan ringkasan kondisi bisnis.

## Structure

1. Page Header.
2. Date Filter.
3. KPI Cards.
4. Sales Chart.
5. Profit Chart.
6. Recent Sales.
7. Optional operational summary.

Example:

```text
Dashboard
Ringkasan performa Mahaputra Group

[ Bulan Ini ▼ ]

[Kendaraan] [Ready] [Terjual] [Laba]

[ Grafik Penjualan              ]
[                               ]

[ Grafik Keuntungan             ]
[                               ]

Penjualan Terbaru
[ Table                        ]
```

Owner dashboard should prioritize:

* penjualan,
* laba,
* operasional,
* keuntungan.

Admin dashboard may prioritize:

* kendaraan ready,
* kendaraan preparation,
* transaksi terbaru.

---

# Page: Data Kendaraan

* Route: `/vehicles`
* Related requirements:

  * FR-VEH-007
* Primary user: Admin, Owner
* Page goal: Melihat seluruh kendaraan.

## Structure

1. Header.
2. Search/filter/action.
3. Vehicle cards.
4. Pagination.

Header:

```text
Data Kendaraan                    [+ Tambah Kendaraan]
```

Owner does not see `Tambah Kendaraan`.

Filters:

```text
Search No Polisi/Tipe

Status
Merk
Jenis Modal
```

Cards display:

* Photo.
* Brand/type.
* Plate.
* Year.
* Status.
* Capital Type.
* Asking price.

---

# Page: Tambah Kendaraan

* Route: `/vehicles/create`
* Primary user: Admin

## Structure

### Section 1 — Informasi Kendaraan

* Tanggal Pembelian.
* Merk.
* Tipe.
* No Polisi.
* Tahun.
* Warna.
* Foto.

### Section 2 — Dokumen dan Pajak

* Pajak ON/OFF.
* Nominal Pajak jika relevan.
* STNK.
* BPKB.

### Section 3 — Sumber Modal

Select:

```text
Jenis Kendaraan

( ) UMUM
( ) KHUSUS
```

UMUM:

```text
Modal Showroom

Total Modal Awal
Rp xxx
```

KHUSUS:

```text
Nama Kolaborator
Modal Showroom
Modal Kolaborator

Total Modal Awal
Rp xxx
```

### Section 4 — Biaya Kendaraan

```text
Pajak             Rp ...
Dico              Rp ...
Kelistrikan/
Kaki-kaki         Rp ...

Biaya lainnya
+ Tambah Biaya
```

Summary:

```text
Total Biaya       Rp ...
Modal Akhir       Rp ...
```

### Section 5 — Penjualan

* Harga Penawaran.
* Status awal.

### Bottom actions

```text
[Batal]                       [Simpan Kendaraan]
```

Desktop action bar may remain sticky at bottom for long forms.

---

# Page: Detail Kendaraan

* Route: `/vehicles/{id}`
* Primary user: Admin, Owner

## Structure

### Header

```text
← Kendaraan

Toyota Avanza
DD 1234 XX

READY   KHUSUS

[Edit] [PDF] [Terjual]
```

### Content

Desktop:

```text
┌─────────────────────┬──────────────────────────┐
│                     │ Informasi kendaraan      │
│      Vehicle        │                          │
│       Photos        │ Dokumen                  │
│                     │                          │
│                     │ Modal & Biaya            │
│                     │                          │
│                     │ Financial Summary        │
└─────────────────────┴──────────────────────────┘
```

Owner hides editing actions.

---

# Page: Form Penjualan

* Route: `/vehicles/{vehicle}/sell`
* Related requirement: FR-SALE-001
* Primary user: Admin

## Top Vehicle Summary

Before customer form show:

```text
Toyota Avanza • DD 1234 XX

Harga Penawaran
Rp 150.000.000

Modal Akhir
Rp 120.000.000
```

This prevents admin losing context.

## Section 1 — Informasi Pembeli

* Nama.
* WhatsApp.
* WhatsApp alternatif.
* Alamat.
* Upload KTP.

## Section 2 — Informasi Transaksi

* Area.
* PIC.
* Harga Terjual.

## Section 3 — Metode Pembayaran

Use large radio/card selection:

```text
┌──────────────┐  ┌──────────────┐
│     CASH     │  │    KREDIT    │
└──────────────┘  └──────────────┘
```

### CASH

No credit fields.

Summary:

```text
Harga Terjual    Rp ...
Modal Akhir      Rp ...
------------------------
Laba             Rp ...
```

### CREDIT

Display:

* Pembiayaan.
* DP.
* DP Terutang.
* Cair Pembiayaan.
* Refund.

Summary:

```text
DP                Rp ...
DP Terutang       Rp ...
Cair Pembiayaan   Rp ...
Refund            Rp ...
-------------------------
Total Penjualan   Rp ...

Modal Akhir       Rp ...
-------------------------
Laba              Rp ...
```

Financial summary should remain visible where practical.

### Final Action

```text
[Batal]               [Simpan & Tandai Terjual]
```

Before final save:

Confirmation dialog:

```text
Tandai kendaraan sebagai terjual?

Toyota Avanza — DD 1234 XX

Transaksi akan disimpan dan status kendaraan
akan berubah menjadi Terjual.

[Batal] [Ya, Simpan Transaksi]
```

---

# Page: Rekap Penjualan

* Route: `/sales`
* Primary user: Admin, Owner

## Structure

Header:

```text
Rekap Penjualan

[Export PDF] [Export Excel]
```

Filters:

* Search.
* Date range.
* Area.
* PIC.
* Payment.
* UMUM/KHUSUS.

Table:

```text
No
Tanggal
Area
PIC
Kendaraan
No Polisi
UMUM/KHUSUS
Pembayaran
Harga Jual
Modal Akhir
Laba
Action
```

Detailed financial fields can be shown in expanded detail or report export rather than making the default table excessively wide.

---

# Page: Operasional

* Route: `/operations`
* Primary user: Admin, Owner

## Structure

### Header

Admin:

```text
Operasional                 [+ Tambah Transaksi]
```

Owner:

```text
Operasional
```

### Summary

```text
Total Operasional Bulan Ini
Rp xx.xxx.xxx
```

### Filters

* Date.
* Category.

### Table

* Date.
* Category.
* Description.
* Amount.
* Proof.
* Action.

---

# Page: Laporan

* Route: `/reports`
* Primary user: Admin, Owner

Recommended report cards:

```text
Penjualan
Kendaraan
Operasional
Keuntungan
```

Each report provides:

* filters,
* preview,
* PDF,
* Excel.

---

# Page: Master Data

* Route: `/master/*`
* Primary user: Admin

Contents:

* Employee.
* Area.
* Vehicle Brand.
* Financing Provider.
* Operational Categories.

Recommended interaction:

Table + simple create/edit modal.

Do not use full-page forms for small master-data entries.

---

# 10. Form Behavior

## Validation Timing

Required/basic validation:

```text
On blur + on submit
```

Avoid aggressive validation before user finishes typing.

Cross-field business rules:

```text
On submit
```

plus client-side preview where useful.

Server remains authoritative.

---

## Error Behavior

Long form:

* Preserve values.
* Show inline error.
* Scroll to first error.
* Focus first invalid field.

Example:

Bad:

```text
Invalid input.
```

Better:

```text
Modal kolaborator wajib diisi untuk kendaraan KHUSUS.
```

---

## Submit Behavior

* Disable button during submit.
* Show spinner.
* Preserve button width.
* Prevent double click.
* Success redirects to detail where appropriate.

### Add vehicle

```text
Save → Vehicle Detail
```

### Sale

```text
Save → Sale Detail / Vehicle Sold Detail
```

### Operational

```text
Save → Operational List
```

Dirty long forms:

```text
Warn before leaving
```

when user has unsaved data.

---

# 11. Search, Filter, Sort, and Pagination

Search debounce:

```text
300ms
```

URL synchronization:

```text
Yes
```

Example:

```text
/vehicles?status=READY&brand=Toyota
```

Benefits:

* Back navigation works.
* Filter can be bookmarked.
* State does not disappear unexpectedly.

Default sorting:

### Vehicles

```text
purchase_date DESC
```

### Sales

```text
sale_date DESC
```

### Operations

```text
transaction_date DESC
```

Active filters:

```text
Filter chips
```

Example:

```text
Status: Ready ×
Area: Bone ×
```

Clear behavior:

```text
Clear Semua
```

Pagination:

```text
25 / 50 / 100
```

Back navigation preserves filter state.

---

# 12. Charts and Numeric Data

Recommended chart library:

**Recharts**

because:

* React-native ecosystem.
* Easy responsive charts.
* Appropriate for dashboard.
* Simple implementation.

Required charts:

### Sales Trend

Recommended:

```text
Bar chart
```

or line chart if showing longer time trend.

### Profit Trend

Recommended:

```text
Line chart
```

### Profit Composition

Pie/donut only if categories are meaningful and limited.

Avoid excessive pie charts.

## Chart Color Strategy

Yellow may represent main Mahaputra series.

Additional series should use:

* dark neutral,
* blue,
* green,

while maintaining accessibility.

Never distinguish multiple chart series only by slightly different yellow shades.

## Currency

Display:

```text
Rp 125.000.000
```

Compact dashboard:

```text
Rp125 jt
Rp1,2 M
```

Tooltip should show full value.

## Negative Values

Display:

```text
-Rp 2.500.000
```

with:

* negative sign,
* danger icon/color,
* text when context requires.

## No Data

Do not render meaningless empty chart.

Display:

```text
Belum ada data penjualan untuk periode ini.
```

---

# 13. Loading, Empty, Error, and Success Patterns

| State             | Required content                   | Primary action |
| ----------------- | ---------------------------------- | -------------- |
| Loading           | Skeleton preserving layout         | None           |
| Empty-first-use   | Explain that data is not available | Create/add     |
| Empty-filtered    | Explain no data match filters      | Clear filters  |
| Error-recoverable | Explain failure                    | Retry          |
| Error-blocking    | Explain next action                | Back           |
| Success           | Confirm result                     | Continue/view  |

Skeleton recommended for:

* KPI.
* Vehicle card.
* Table.
* Dashboard chart containers.

Avoid full-page spinner if skeleton can preserve layout.

---

# 14. Responsive Rules

Touch targets minimum:

```text
44 × 44px
```

## Tables

Desktop:

```text
Full data table
```

Mobile:

Options:

1. Horizontal table scroll for financial reports.
2. Card transformation for simple lists.

Recommended:

* Vehicle listing → cards.
* Sales report → horizontal table.
* Operational history → responsive cards/table.

## Forms

Mobile:

```text
1 column
```

Tablet:

```text
1–2 columns
```

Desktop:

```text
2 columns where related
```

Do not place unrelated fields simply to fill columns.

## Modal

Mobile:

```text
Fullscreen or near-fullscreen
```

## Primary Action

On long mobile forms:

```text
Sticky bottom action bar
```

can be used.

Avoid horizontal page scrolling outside designated tables.

---

# 15. Accessibility

Target:

```text
WCAG 2.2 AA
```

Requirements:

* Keyboard accessible.
* Logical tab order.
* Visible focus.
* Input labels connected to inputs.
* Error linked to relevant input.
* Icons have accessible label where needed.
* Image alt text appropriate.
* Dynamic feedback announced where necessary.
* Color is not the sole status signal.

Focus token:

```text
Yellow outer focus ring
+
dark outline where necessary
```

Example:

```text
2px dark outline
2px yellow outer ring
```

so focus remains visible on both white and dark surfaces.

---

# 16. Motion and Feedback

Default duration:

```text
150–200ms
```

Easing:

```text
ease-out
```

Use for:

* dropdown.
* drawer.
* button state.
* accordion.
* modal.

Avoid:

* animated KPI counters.
* excessive chart entrance animation.
* decorative page transitions.

Respect:

```text
prefers-reduced-motion
```

---

# 17. Content and Microcopy

Language:

```text
Bahasa Indonesia
```

Tone:

```text
Direct, professional, concise
```

Use verbs:

* Simpan.
* Tambah.
* Edit.
* Unduh.
* Lihat Detail.
* Tandai Terjual.
* Batalkan.
* Coba Lagi.

Avoid:

```text
OK
Submit
Yes
No
```

when specific labels are possible.

Example:

Instead of:

```text
Submit
```

use:

```text
Simpan Kendaraan
```

Instead of:

```text
Yes
```

use:

```text
Ya, Tandai Terjual
```

---

# 18. Images and Media

## Vehicle Image

Recommended aspect ratio:

```text
4:3
```

or:

```text
16:9
```

depending on available showroom photography.

For card consistency:

Recommended:

```text
4:3
```

Cropping:

```text
cover
```

Detail view:

```text
contain / gallery
```

Accepted:

* JPG.
* JPEG.
* PNG.
* WEBP.

Recommended maximum:

```text
5 MB per image
```

Client/server optimization should compress large vehicle photos where possible.

---

## Sensitive Documents

KTP/STNK/BPKB:

Accepted:

* JPEG.
* PNG.
* WEBP.
* PDF if required.

Maximum:

```text
10 MB
```

Subject to technical confirmation.

Preview should clearly indicate:

```text
Dokumen Internal
```

Avoid exposing KTP in table thumbnails.

---

# 19. UI Implementation Rules

React component path:

```text
resources/js/Components/
resources/js/Features/
```

Rules:

* Reuse components.
* Do not add UI library without approval.
* Tailwind design tokens should map to project tokens.
* Avoid arbitrary hex colors inside component files.
* Business rules remain in Laravel/domain.
* TypeScript types should be explicit if TypeScript is used.
* Every async page implements loading/error/empty states.
* Financial fields use shared currency component/helper.
* Status badge uses shared component.
* Confirmation dialog uses shared component.
* Forms use common FormField/error pattern.

Recommended shared components:

```text
Button
Input
CurrencyInput
Select
DateInput
Textarea
FileUpload
Badge
StatusBadge
Card
KpiCard
DataTable
Pagination
FilterBar
EmptyState
ErrorState
ConfirmDialog
Modal
Toast
PageHeader
FormSection
CurrencyDisplay
VehicleCard
```

---

# 20. UI QA Checklist

## Visual

* [ ] Brand black/yellow used consistently.
* [ ] Yellow not overused.
* [ ] Typography uses token.
* [ ] Spacing uses token.
* [ ] Radius uses token.
* [ ] Long Rupiah amounts do not overflow.
* [ ] Vehicle images maintain consistent ratio.
* [ ] No clipping at 360, 768, 1280 and 1440px.

## Behavior

* [ ] Loading states exist.
* [ ] Empty states exist.
* [ ] Error states exist.
* [ ] Success states exist.
* [ ] Duplicate submissions prevented.
* [ ] Conditional UMUM/KHUSUS works.
* [ ] Conditional CASH/KREDIT works.
* [ ] Financial summaries update correctly.
* [ ] Destructive/financial actions have confirmation where required.
* [ ] Filter state remains consistent.

## Responsive

* [ ] Sidebar becomes drawer.
* [ ] Forms work at mobile width.
* [ ] Tables have appropriate overflow.
* [ ] Vehicle cards resize correctly.
* [ ] Primary actions remain accessible.

## Accessibility

* [ ] Keyboard navigation works.
* [ ] Focus visible.
* [ ] Label relationships correct.
* [ ] Contrast passes WCAG target.
* [ ] Status is represented with text.
* [ ] Error messages are accessible.

---

# 21. Page Inventory and Status

| Page                 | Route                         | Figma frame | Status | Notes          |
| -------------------- | ----------------------------- | ----------- | ------ | -------------- |
| Login                | `/login`                      | TBD         | DRAFT  | Admin + Owner  |
| Dashboard            | `/dashboard`                  | TBD         | DRAFT  | Role-sensitive |
| Data Kendaraan       | `/vehicles`                   | TBD         | DRAFT  | Card listing   |
| Tambah Kendaraan     | `/vehicles/create`            | TBD         | DRAFT  | Admin          |
| Detail Kendaraan     | `/vehicles/{id}`              | TBD         | DRAFT  | Admin/Owner    |
| Edit Kendaraan       | `/vehicles/{id}/edit`         | TBD         | DRAFT  | Admin          |
| Form Penjualan       | `/vehicles/{id}/sell`         | TBD         | DRAFT  | Admin          |
| Detail Penjualan     | `/sales/{id}`                 | TBD         | DRAFT  | Admin/Owner    |
| Rekap Penjualan      | `/sales`                      | TBD         | DRAFT  | Reports        |
| Operasional          | `/operations`                 | TBD         | DRAFT  | Admin/Owner    |
| Tambah Operasional   | `/operations/create`          | TBD         | DRAFT  | Admin          |
| Laporan              | `/reports`                    | TBD         | DRAFT  | Admin/Owner    |
| Karyawan             | `/master/employees`           | TBD         | DRAFT  | Admin          |
| Area                 | `/master/areas`               | TBD         | DRAFT  | Admin          |
| Merk                 | `/master/vehicle-brands`      | TBD         | DRAFT  | Admin          |
| Pembiayaan           | `/master/financing-providers` | TBD         | DRAFT  | Admin          |
| Kategori Operasional | `/master/expense-categories`  | TBD         | DRAFT  | Admin          |

---

# 22. Open UI Decisions

| ID      | Question                                                                              | Owner         | Decision/status       |
| ------- | ------------------------------------------------------------------------------------- | ------------- | --------------------- |
| UIQ-001 | Logo final Mahaputra Group dan asset brand apa yang tersedia?                         | Owner/Product | OPEN                  |
| UIQ-002 | Apakah sidebar harus selalu expanded atau dapat collapsed?                            | Product/UI    | PROPOSED: Collapsible |
| UIQ-003 | Apakah BOOKING benar-benar dibutuhkan sebagai status kendaraan?                       | Admin/Product | OPEN                  |
| UIQ-004 | Apakah kendaraan PREPARATION ditampilkan bersama READY atau tab terpisah?             | Admin/Product | OPEN                  |
| UIQ-005 | Berapa jumlah foto maksimal per kendaraan?                                            | Admin/Product | MVP: 5, final TBD     |
| UIQ-006 | Apakah foto kendaraan memiliki satu cover image utama?                                | Admin/Product | PROPOSED: Yes         |
| UIQ-007 | Data apa saja yang perlu terlihat langsung pada Vehicle Card?                         | Admin/Product | OPEN                  |
| UIQ-008 | Apakah Owner boleh melihat detail customer atau hanya laporan finansial?              | Owner/Product | OPEN                  |
| UIQ-009 | Grafik keuntungan apa yang paling dibutuhkan Owner: bulanan, per area, atau keduanya? | Owner/Product | OPEN                  |
| UIQ-010 | Apakah dark mode diperlukan?                                                          | Product       | PROPOSED: No for MVP  |
| UIQ-011 | Apakah tabel rekap membutuhkan column customization?                                  | Admin/Product | FUTURE                |
| UIQ-012 | Apakah transaksi SOLD yang diedit membutuhkan visual warning khusus?                  | Product/UI    | PROPOSED: Yes         |

---

# 23. Change Log

| Version | Date       | Change                                  | Author                 |
| ------- | ---------- | --------------------------------------- | ---------------------- |
| 0.1     | 2026-08-07 | Initial Mahaputra Apps UI specification | IT Product Development |
