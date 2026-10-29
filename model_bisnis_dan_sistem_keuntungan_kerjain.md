# Model Bisnis & Sistem Keuntungan Platform KerjaIN
**Dokumen Strategi Finansial & Monetisasi (Mata Kuliah Kewirausahaan)**  
**Versi:** 1.0  
**Status:** Siap Presentasi & Analisis Kelayakan Usaha  

---

## 1. Ringkasan Eksekutif Model Bisnis
**KerjaIN** beroperasi dengan model bisnis **Managed Marketplace & Asistensi Rekayasa (STEM)** berbasis komisi (*take rate*) dan layanan bernilai tambah (*value-added services*). 

Karakteristik finansial utama platform ini adalah:
1. **Zero Inventory & Low Asset Risk:** Platform tidak memproduksi hardware fisik sendiri dan tidak menanggung gaji tetap konsultan; biaya konsultan bersifat variabel (*revenue-sharing per project*).
2. **Negative Working Capital Advantage:** Melalui sistem *escrow*, platform menerima pembayaran uang muka (DP 50%) dan pelunasan di muka sebelum dana bersih diteruskan ke konsultan, menjaga likuiditas kas (*cash flow*) tetap positif.
3. **Scalable Margins:** Biaya operasional marginal untuk menambah 1 transaksi baru sangat kecil (hanya beban server, API gateway, dan komisi payment gateway).

---

## 2. Rincian Aliran Pendapatan (Revenue Streams)

Platform KerjaIN memiliki 4 pilar sumber pendapatan utama:

```text
                           ALIRAN PENDAPATAN KERJAIN
                                      │
         ┌──────────────────┬─────────┴────────┬──────────────────┐
         ▼                  ▼                  ▼                  ▼
1. Komisi Transaksi   2. Bimbingan 1-on-1   3. Express Surcharge  4. Add-on & Revisi
   (Take Rate 18%)       (Persiapan Sidang)     (Deadline < 3 Hari)   (Adendum Scope)
```

### 2.1. Komisi Transaksi Pokok (Platform Take Rate) — *Primary Stream (70%)*
* **Mekanisme:** KerjaIN memotong komisi sebesar **15% – 20% (rata-rata 18%)** dari total nilai kontrak proyek yang disepakati di dalam *Quotation*.
* **Dasar Pemotongan:** Biaya fasilitas rekening bersama (*escrow*), penjaminan kerahasiaan file (NDA), sistem brankas proteksi file, serta garansi mediasi jika terjadi ketidaksesuaian.
* **Contoh Kasus:**
  * Total Nilai Proyek Skripsi: **Rp 1.000.000**
  * DP 50% masuk ke Escrow: Rp 500.000
  * Pelunasan 50% saat serah terima: Rp 500.000
  * **Pendapatan Bersih Platform (18%): Rp 180.000**
  * Pencairan Bersih ke Konsultan (82%): Rp 820.000

---

### 2.2. Bimbingan Intensif 1-on-1 Berbayar (Mentoring Pra-Sidang) — *Secondary Stream (18%)*
* **Mekanisme:** Banyak mahasiswa tidak hanya butuh alatnya jadi, tetapi **wajib memahami cara kerja alat** agar tidak dicecar dosen saat sidang skripsi/tugas akhir.
* **Paket Layanan:**
  * Sesi Bimbingan Bedah Rumus & Wiring: **Rp 150.000 / jam**
  * Sesi Bimbingan Bedah Baris Kode Program: **Rp 175.000 / jam**
* **Bagi Hasil:**
  * Konsultan: 70% (misal: Rp 105.000 / jam)
  * **Platform KerjaIN: 30% (misal: Rp 45.000 / jam)**

---

### 2.3. Biaya Tambahan Deadline Kilat (Express / Rush Fee) — *High-Margin Stream (8%)*
* **Mekanisme:** Tambahan biaya sebesar **30% – 50%** untuk proyek darurat yang memiliki tenggat waktu kurang dari 3–5 hari.
* **Bagi Hasil:**
  * 70% dari *rush fee* diberikan ke konsultan sebagai insentif lembur kerja malam.
  * **30% dari rush fee menjadi laba langsung platform.**
* **Contoh:** Proyek normal Rp 800.000 dikenakan *rush fee* 40% (+Rp 320.000) -> Total Rp 1.120.000. Platform meraup komisi pokok + porsi rush fee.

---

### 2.4. Tiket Revisi Tambahan di Luar Kuota (Scope Adendum) — *Ancillary Stream (4%)*
* **Mekanisme:** Setiap proyek diberi 3x kuota revisi minor gratis. Jika mahasiswa merombak konsep dasar di luar *Scope of Work* (misal: ganti mikrokontroler dari Arduino ke STM32), dikenakan biaya adendum resmi:
  * Tiket Revisi Mayor: **Rp 75.000 – Rp 150.000 per tiket**
  * Komisi Platform: **20% per tiket**.

---

## 3. Simulasi Unit Economics (Per Proyek)

Berikut analisis biaya langsung dan margin laba bersih untuk **1 transaksi proyek skripsi rata-rata (Rp 800.000)**:

| Komponen Finansial | Nominal (Rp) | Persentase | Keterangan |
| :--- | :--- | :--- | :--- |
| **Gross Merchandise Value (GMV)** | **Rp 800.000** | 100.00% | Nilai total transaksi yang dibayar mahasiswa |
| Payout Bersih Konsultan | (Rp 656.000) | 82.00% | Diteruskan ke rekening mitra engineer |
| **Pendapatan Kotor Platform (Gross Revenue)** | **Rp 144.000** | **18.00%** | **Take Rate Platform KerjaIN** |
| Biaya Payment Gateway (QRIS 0.7%) | (Rp 5.600) | 0.70% | Fee MDR resmi QRIS Bank Indonesia |
| Biaya Notifikasi WhatsApp API (4 notif @ Rp 400) | (Rp 1.600) | 0.20% | Notif booking, invoice, review, dan serah terima |
| Biaya Cloud Object Storage (R2/S3 - 500 MB) | (Rp 500) | 0.06% | Penyimpanan aman file CAD & ZIP |
| **Laba Bersih Platform per Transaksi (Contribution Margin)** | **Rp 136.300** | **17.04%** | **Margin Laba Bersih Operasional ~94.6% dari Gross Revenue** |

> **Temuan Kunci:** Biaya langsung (*Direct COGS*) per transaksi sangat minim (hanya ~Rp 7.700 per proyek). Sehingga hampir **94%** dari komisi yang ditarik platform langsung menjadi laba kotor operasional (*gross profit*).

---

## 4. Struktur Biaya Operasional (Cost Structure)

### 4.1 Biaya Variabel (Variable Costs / COGS)
1. **Payment Gateway MDR Fee:** 0.7% untuk QRIS, atau Rp 3.000–4.000 untuk Bank Virtual Account (dibebankan ke platform atau ditambahkan transparan sebagai biaya admin).
2. **Third-Party Messaging API:** WhatsApp Cloud API / Fonnte (~Rp 350 – Rp 450 per pesan status transaksi).
3. **Cloud Storage Bandwidth:** AWS S3 / Cloudflare R2 untuk menampung file `.SLDPRT`, `.STEP`, `.HEX`, dan rekaman video uji gerak.

### 4.2 Biaya Tetap Bulanan (Monthly Fixed Operational Costs)
Untuk tahap awal (*Early Stage Bootstrapping*):

| Pos Pengeluaran | Estimasi Biaya / Bulan | Keterangan |
| :--- | :--- | :--- |
| Cloud Hosting & VPS (Node.js/Database) | Rp 250.000 | Server cloud dengan backup harian |
| Domain & SSL Terkelola | Rp 30.000 | Biaya domain per tahun diamortisasi |
| Admin / Dispatcher Mahasiswa (Part-Time) | Rp 1.200.000 | 1 orang QA dan operator pemetaan sesi |
| Budget Promosi & Direct Marketing Kampus | Rp 800.000 | Poster himpunan mahasiswa, sponsorship seminar robotika |
| **Total Biaya Tetap Bulanan (Fixed OPEX)** | **Rp 2.280.000** | **Beban operasional dasar yang harus ditutup** |

---

## 5. Analisis Titik Impas (Break-Even Point / BEP)

Dengan biaya tetap bulanan sebesar **Rp 2.280.000** dan rata-rata kontribusi laba bersih per transaksi sebesar **Rp 136.300**:

$$\text{BEP (Unit Proyek)} = \frac{\text{Total Biaya Tetap}}{\text{Margin Kontribusi per Transaksi}} = \frac{\text{Rp 2.280.000}}{\text{Rp 136.300}} \approx \mathbf{16.7 \text{ Proyek / Bulan}}$$

$$\text{BEP (Nilai Omset/GMV)} = 17 \text{ Proyek} \times \text{Rp 800.000} = \mathbf{Rp 13.600.000 \text{ / Bulan}}$$

* **Kesimpulan BEP:** Platform KerjaIN sudah mencapai titik impas hanya dengan menyelesaikan **17 proyek per bulan** (atau kurang dari 1 proyek per hari di seluruh kampus Indonesia).

---

## 6. Proyeksi Keuangan Tahun Pertama (Financial Projections)

Skenario target realistis berdasarkan kalender akademik (puncak proyek di bulan UTS/UAS dan semester akhir: Maret–Juni & Oktober–Januari):

| Kuartal | Target Proyek Selesai | Estimasi GMV Transaksi | Pendapatan Kotor Platform (18%) | Biaya Operasional (Fixed + Var) | Laba Bersih Platform (Net Profit) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Q1 (Launch & Validasi Kampus)** | 60 proyek | Rp 48.000.000 | Rp 8.640.000 | Rp 7.300.000 | **+ Rp 1.340.000** |
| **Q2 (Puncak Skripsi Semester Genap)** | 180 proyek | Rp 144.000.000 | Rp 25.920.000 | Rp 9.800.000 | **+ Rp 16.120.000** |
| **Q3 (Libur Semester & Proyek PKM)** | 90 proyek | Rp 72.000.000 | Rp 12.960.000 | Rp 8.200.000 | **+ Rp 4.760.000** |
| **Q4 (Puncak Tugas Besar Ganjil)** | 220 proyek | Rp 176.000.000 | Rp 31.680.000 | Rp 11.200.000 | **+ Rp 20.480.000** |
| **TOTAL TAHUN 1** | **550 proyek** | **Rp 440.000.000** | **Rp 79.200.000** | **Rp 36.500.000** | **+ Rp 42.700.000** |

---

## 7. Customer Acquisition Cost (CAC) vs Customer Lifetime Value (LTV)

* **CAC (Biaya Akuisisi 1 Mahasiswa):** Melalui strategi *Direct Booking Konsultasi Gratis* dan *word-of-mouth* di lab kampus, estimasi CAC adalah **Rp 25.000 – Rp 35.000** (distribusi brosur lab, relasi asisten lab, dan konten edukasi medsos).
* **LTV (Nilai Seumur Hidup Pelanggan):** Mahasiswa teknik rata-rata menggunakan jasa 2x selama masa kuliah (1x saat Tugas Besar Tingkat 3 dan 1x saat Prototipe Skripsi Tingkat 4), plus 1 sesi bimbingan persiapan sidang:
  $$\text{LTV} = (2 \times \text{Rp 144.000}) + \text{Rp 45.000} = \mathbf{Rp 333.000}$$
* **Rasio LTV : CAC = 9.5 : 1** (Sangat sehat; standar bisnis rintisan teknologi yang baik umumnya di atas 3 : 1).

---

## 8. Mengapa Model Keuntungan Ini Sangat Disukai Dosen Kewirausahaan?

1. **Bukan Sekadar Teori, Arsitekturnya Siap Pakai:** Dokumen ini langsung terintegrasi dengan kode aplikasi web KerjaIN yang memiliki brankas escrow, status termin DP, dan pembagian fee otomatis.
2. **Model Risiko Sangat Rendah (Asset-Light):** Tidak membutuhkan modal mesin CNC/3D printer mahal di awal; KerjaIN memanfaatkan keahlian asisten lab/praktisi lepas yang sudah memiliki software dan komputer kerja masing-masing.
3. **Etika Akademik Terjaga:** Pendapatan tidak dijual sebagai "joki terima beres", melainkan asistensi perancangan, bimbingan teknis, dan verifikasi kelayakan alat yang mendidik mahasiswa memahami proyeknya sendiri.
