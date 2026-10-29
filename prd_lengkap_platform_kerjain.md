# Product Requirements Document (PRD): KerjaIN
**Versi:** 1.0  
**Status:** Draft Final  
**Platform:** Web Application (Responsive Desktop & Mobile)  
**Target Rilis:** Q4 2026 / Q1 2027  

---

## 1. Gambaran Umum Produk (Product Overview)
**KerjaIN** adalah platform berbasis web yang menyediakan layanan konsultasi, bimbingan teknis, dan asistensi pengerjaan proyek kuliah (tugas besar, PKM, prototipe skripsi/tugas akhir) khusus untuk mahasiswa bidang teknik dan sains (STEM).

### 1.1 Value Proposition
Menghubungkan mahasiswa yang mengalami kendala teknis proyek dengan mentor/praktisi ahli secara terstruktur, transparan, dan terarah melalui pintu masuk **Konsultasi Gratis** sebelum memutuskan menggunakan layanan berbayar, dilengkapi sistem keamanan transaksi (*escrow*) dan proteksi file kerja.

### 1.2 Layanan Inti
1. **Mechanical & 3D Design:** Pemodelan 3D, *assembly*, simulasi FEA/CFD, dan *technical drawing* (SolidWorks, AutoCAD, Fusion 360, Inventor).
2. **Electrical & Schematic Diagram:** Perancangan skematik rangkaian, desain layout PCB, *wiring diagram* panel, dan pemilihan komponen (Eagle, Altium, Proteus, EasyEDA).
3. **Programming & Automation/IoT:** Pembuatan kode mikrokontroler (Arduino, ESP32, STM32, Raspberry Pi), pemrograman PLC & HMI/SCADA, komunikasi industri (Modbus/RS485), hingga aplikasi antarmuka (Web/Mobile/Python).

---

## 2. Target Pengguna (User Personas)

| Persona | Karakteristik & Kebutuhan | Pain Points (Masalah Utama) |
| :--- | :--- | :--- |
| **Mahasiswa (Klien)** | Mahasiswa tingkat akhir atau peserta kompetisi (PKM/Robotika) yang membutuhkan bantuan teknis lintas disiplin (misal: mahasiswa Mesin butuh kode kontrol, atau mahasiswa IT butuh desain 3D mekanik). | Bingung mulai dari mana, takut ditipu jasa joki di media sosial, biaya tidak transparan, dan butuh diskusi kelayakan alat sebelum membayar. |
| **Konsultan / Engineer (Mitra)** | Asisten laboratorium, *fresh graduate*, atau praktisi *freelance* yang menguasai CAD, PCB design, atau pemrograman otomasi/IoT. | Sulit mendapatkan klien yang jelas spesifikasinya, revisi tanpa batas (*scope creep*), dan klien kabur saat proyek sudah selesai dikerjakan. |
| **Admin KerjaIN** | Pengelola operasional platform dan penjamin mutu (*Quality Assurance*). | Kesulitan memantau progres banyak proyek sekaligus dan mencocokkan keahlian *engineer* dengan kebutuhan spesifik klien. |

---

## 3. Spesifikasi Fungsional (Functional Requirements)

### 3.1 Modul Klien (Mahasiswa)
* **FR-C01: Katalog Layanan & Portofolio:** Menampilkan kategori layanan (3D Design SolidWorks, Skematik & PCB, Pemrograman/IoT) beserta studi kasus proyek terdahulu dan kalkulator estimasi harga dasar.
* **FR-C02: Sistem Booking Konsultasi Gratis (Lead Magnet):**
  * Formulir pengajuan sesi konsultasi gratis (durasi 15–30 menit via Google Meet/Zoom atau Live Chat).
  * Pemilihan jadwal di kalender ketersediaan, pemilihan kategori masalah, dan fitur unggah gambaran kasar proyek (sketsa/jurnal acuan).
  * Validasi kuota: dibatasi 1x sesi gratis per akun/proyek untuk mencegah penyalahgunaan.
* **FR-C03: Custom Project Request & Quotation Approval:**
  * Konversi langsung pasca konsultasi gratis melalui tombol **"Lanjutkan ke Proyek Berbayar"**.
  * Penerimaan dokumen *Quotation* digital (rincian *Scope of Work*, biaya, tahapan pengerjaan/*milestone*, dan kuota revisi) yang dapat disetujui di dalam web.
* **FR-C04: Workspace & Project Tracker:**
  * Pelacakan status proyek secara *real-time*: `Menunggu Pembayaran` -> `Pengerjaan Tahap 1` -> `Review/Revisi` -> `Selesai`.
  * **Brankas File (Preview vs Master):** Klien dapat melihat gambar *render* SolidWorks, PDF skematik ber-*watermark*, atau video simulasi sebelum lunas, namun *source file* asli terkunci.
* **FR-C05: Tiket Revisi Terstruktur:** Form pengajuan revisi yang memotong kuota revisi yang disepakati di awal (misal: 3x revisi gratis) agar tidak terjadi perubahan konsep di luar kesepakatan.
* **FR-C06: Pembayaran Bertahap (Escrow / Down Payment):** Integrasi Payment Gateway (QRIS, Virtual Account, E-Wallet) untuk pembayaran DP 50% dan pelunasan 50% sebelum *source file* dapat diunduh.

### 3.2 Modul Konsultan (Engineer)
* **FR-E01: Manajemen Jadwal Konsultasi:** Pengaturan slot waktu luang untuk sesi konsultasi gratis maupun sesi bimbingan berbayar.
* **FR-E02: Quotation Builder:** Form penyusunan ruang lingkup kerja (*Scope of Work*), rincian *deliverables* (jumlah *part* 3D, jumlah *layer* PCB, modul sensor/aktuator), biaya, dan tenggat waktu.
* **FR-E03: Manajemen File & Lock System:** Fitur unggah file *Preview* (terbuka) dan *Master Source File* (`.SLDPRT`, `.STEP`, `.SCH`, `.HEX`, `.INO`, `.ZIP`) yang otomatis terkunci oleh sistem hingga status tagihan klien berubah menjadi `LUNAS`.

### 3.3 Modul Admin (Back-Office)
* **FR-A01: Project Dispatcher:** Meneruskan permintaan konsultasi gratis atau proyek baru ke konsultan yang sesuai dengan bidang keahlian.
* **FR-A02: Manajemen Escrow & Komisi:** Mengelola penahanan dana DP/Pelunasan klien dan pencairan dana (*payout*) ke konsultan setelah dipotong komisi platform.
* **FR-A03: Dispute Resolution Center:** Ruang mediasi jika terjadi komplain ketidaksesuaian antara hasil kerja konsultan dengan *Scope of Work* awal.

---

## 4. Alur Pengguna Utama (User Flow)

1. **Eksplorasi:** Mahasiswa membuka web KerjaIN -> memilih kategori masalah (misal: Desain 3D Mekanik + Program Mikrokontroler).
2. **Konsultasi Gratis:** Mahasiswa mengisi *Direct Booking Widget* di halaman utama -> memilih jadwal & unggah sketsa -> menerima tautan Google Meet otomatis via Email/WhatsApp.
3. **Penawaran (Quotation):** Sesi konsultasi selesai -> Konsultan menyusun rincian *Scope of Work* & harga -> dikirim ke dashboard mahasiswa.
4. **Pembayaran Awal (DP):** Mahasiswa menyetujui *Quotation* -> membayar DP 50% melalui QRIS/VA ke sistem *escrow* KerjaIN.
5. **Eksekusi & Review:** Konsultan mengerjakan proyek -> mengunggah file *Preview* (gambar render/video/skematik watermark) -> mahasiswa meninjau dan mengajukan revisi (jika ada) sesuai kuota.
6. **Penyelesaian (Handover):** Proyek disetujui -> mahasiswa melunasi sisa 50% pembayaran -> gembok *Master Source File* terbuka otomatis -> dana diteruskan ke dompet konsultan.

---

## 5. Struktur Halaman (Sitemap)

```text
KerjaIN Web Platform
├── 1. Public Pages (Tanpa Login)
│   ├── Beranda (Landing Page + Direct Booking Konsultasi Gratis)
│   ├── Katalog Layanan (3D SolidWorks, Skematik & PCB, Program & IoT)
│   ├── Galeri Portofolio & Studi Kasus (Showcase)
│   ├── Cara Kerja & Simulasi Biaya
│   └── Autentikasi (Login / Register / Lupa Password)
│
├── 2. Client Dashboard (Mahasiswa)
│   ├── Overview (Ringkasan Proyek Aktif & Jadwal Konsultasi)
│   ├── Konsultasi Saya (Daftar Sesi Gratis/Berbayar, Link GMeet, Catatan Mentor)
│   ├── Proyek Saya (Workspace)
│   │   ├── Detail Proyek & Milestone Tracker
│   │   ├── Penawaran Harga (Quotation Approval)
│   │   ├── Ruang Diskusi & Tiket Revisi
│   │   └── Brankas File (Preview Render/Skematik & Download Source File)
│   ├── Transaksi & Invoice (Pembayaran DP / Pelunasan)
│   └── Pengaturan Akun
│
├── 3. Consultant Dashboard (Engineer / Mitra)
│   ├── Overview (Antrean Tugas, Pendapatan, Rating)
│   ├── Jadwal & Slot Konsultasi (Atur Jam Kosong & Terima Booking)
│   ├── Manajemen Proyek & Quotation Builder (Buat Rincian Harga & Scope)
│   ├── Workspace Engineer (Upload Progress, Lock/Unlock Source File)
│   └── Dompet & Penarikan Dana (Payout)
│
└── 4. Admin Panel (Back-Office)
    ├── Dispatcher (Assign Konsultasi/Proyek ke Engineer)
    ├── Monitoring Proyek & Resolusi Komplain (Dispute Center)
    └── Manajemen Keuangan (Escrow, Komisi, Pencairan Dana)
```

---

## 6. Spesifikasi Wireframe UI/UX

### 6.1 Wireframe: Halaman Utama (Landing Page)
Fokus utama adalah membangun kredibilitas teknis dan mengarahkan pengunjung langsung ke formulir **Konsultasi Gratis** tanpa hambatan registrasi yang rumit.

```text
+-----------------------------------------------------------------------+
| [LOGO KerjaIN]    Layanan   Portofolio   Cara Kerja   Harga   [Login] |
+-----------------------------------------------------------------------+
|                                                                       |
|  BINGUNG MULAI PROYEK KULIAH ATAU TUGAS AKHIR?                        |
|  Konsultasikan Desain 3D Mekanik, Skematik PCB, hingga                |
|  Program Mikrokontroler bersama Praktisi Ahli.                        |
|                                                                       |
|  [ CTA: Booking Konsultasi Gratis (15 Menit) ]  [ Lihat Portofolio ]  |
|                                                                       |
|  (Visual Kanan: Split 3D Assembly SolidWorks + Skematik + Kode C++)   |
+-----------------------------------------------------------------------+
|  LAYANAN INTI KAMI                                                    |
|  +---------------------+ +---------------------+ +------------------+ |
|  | [Ikon 3D Cube]      | | [Ikon Chip/PCB]     | | [Ikon Terminal]  | |
|  | 3D Design & Mekanik | | Skematik & Layout   | | Program & Sistem | |
|  | - SolidWorks / CAD  | | - Eagle / Altium    | | - Arduino / ESP  | |
|  | - Assembly & Part   | | - Wiring Diagram    | | - PLC / Modbus   | |
|  | - Simulasi FEA/CFD  | | - Desain Casing 3D  | | - Web / Python   | |
|  +---------------------+ +---------------------+ +------------------+ |
+-----------------------------------------------------------------------+
|  ALUR KERJA TRANSPARAN (4 Langkah Mudah)                              |
|  (1. Konsultasi Gratis) -> (2. Terima Quotation) ->                   |
|  (3. Pantau Progres & Revisi) -> (4. Pelunasan & Unduh File + Ajaran) |
+-----------------------------------------------------------------------+
|  FORMULIR CEPAT: JADWALKAN KONSULTASI GRATIS                          |
|  [ Nama & Universitas ]   [ Pilih Kategori: 3D / Skematik / Program ] |
|  [ Pilih Tanggal & Jam ]  [ Upload Sketsa/Jurnal Referensi (Opsional)]|
|  [             TOMBOL: Kunci Jadwal Konsultasi Sekarang             ] |
+-----------------------------------------------------------------------+
```

### 6.2 Wireframe: Dashboard Workspace Klien (`/dashboard/project-detail`)
Dirancang untuk memberikan transparansi progres sekaligus mengamankan hak konsultan melalui fitur penguncian file sumber (*Master Source File Lock*).

```text
+-----------------------------------------------------------------------+
| KerjaIN Workspace               [Notifikasi (2)]  [Profil Mahasiswa]  |
+------------------+----------------------------------------------------+
| MENU NAVIGASI    | PROYEK: #KRJ-204 - Desain Mekanik & Kontrol Otomasi|
|                  | Status: [ DALAM PENGERJAAN - TAHAP 2 ]             |
| > Overview       +----------------------------------------------------+
| > Konsultasi (1) | PROGRESS TRACKER (Milestone)                       |
| > Proyek Saya *  | (v) 1. Konsultasi & Deal Harga                     |
| > Tagihan        | (v) 2. Pembayaran DP 50% (Lunas)                   |
| > Pengaturan     | (*) 3. Pengerjaan Desain 3D & Skematik [Aktif]     |
|                  | ( ) 4. Review & Revisi Klien                       |
| ---------------- | ( ) 5. Pelunasan & Buka Kunci Source File          |
| BUTUH BANTUAN?   +----------------------------------------------------+
| [Chat Admin WA]  | TAB: [ Preview & File ] [ Diskusi & Revisi ]       |
|                  +----------------------------------------------------+
|                  | FILE HASIL KERJA (Brankas Proyek)                  |
|                  |                                                    |
|                  | 1. Render_Assembly_V1.png (Preview Gambar)         |
|                  |    [ Lihat Gambar ] (Bisa diakses)                 |
|                  |                                                    |
|                  | 2. Skematik_Rangkaian_Rev1.pdf (Watermark)         |
|                  |    [ Lihat PDF ] (Bisa diakses)                    |
|                  |                                                    |
|                  | 3. Full_Source_SolidWorks_dan_Kode.zip (45 MB)     |
|                  |    [ GEMBOK: Lunasi Tagihan Tahap 2 untuk Unduh ]  |
|                  |                                                    |
|                  | +------------------------------------------------+ |
|                  | | Sisa Tagihan: Rp 350.000                       | |
|                  | | Kuota Revisi Tersisa: 2 dari 3x Revisi         | |
|                  | | [ Ajukan Revisi ]   [ Bayar Pelunasan (QRIS) ] | |
|                  | +------------------------------------------------+ |
+------------------+----------------------------------------------------+
```

### 6.3 Panduan Gaya Visual (UI Style Guide)
* **Palet Warna:**
  * **Primary (Engineering Blue - `#1E40AF`):** Memberikan kesan teknis, kokoh, dan terpercaya.
  * **Secondary/Accent (Action Orange - `#F97316`):** Digunakan untuk tombol aksi utama (*Call to Action*) seperti *"Booking Konsultasi Gratis"* dan *"Bayar Pelunasan"*.
  * **Background & Surface (`#F8FAFC` & `#FFFFFF`):** Mode terang (*Clean Light Mode*) untuk memastikan keterbacaan skematik rangkaian dan detail gambar teknik 3D.
* **Tipografi:**
  * **Heading & Body:** *Plus Jakarta Sans* atau *Inter*.
  * **Data Teknis / Kode / Nomor Proyek:** *JetBrains Mono* (memberikan identitas *engineering* yang kuat).

---

## 7. Kebutuhan Non-Fungsional & Arsitektur Teknis

* **Keamanan File & Kerahasiaan (NDA):** File proyek dan topik tugas akhir klien dijamin kerahasiaannya. URL unduhan untuk *Master Source File* menggunakan *Signed URL* yang memiliki batas waktu kedaluwarsa dan hanya di-generate jika status pembayaran `PAID_IN_FULL`.
* **Kapasitas Penyimpanan (File Handling):** Mendukung unggah/unduh file arsip berukuran besar (hingga 500 MB per file) untuk mengakomodasi *pack and go* SolidWorks, video simulasi gerakan mekanik, dan repositori program.
* **Rekomendasi Tech Stack:**
  * **Frontend:** Next.js (React) + Tailwind CSS + Shadcn UI.
  * **Backend:** Node.js (NestJS/Express) atau Laravel (PHP).
  * **Database & Storage:** PostgreSQL + AWS S3 / Cloudflare R2 (penyimpanan objek untuk file CAD & ZIP).
  * **Integrasi Pihak Ketiga:** Midtrans / Xendit (Payment Gateway), Fonnte / WhatsApp Business API (notifikasi *booking* & progres), Google Calendar API (penjadwalan sesi konsultasi otomatis).

---

## 8. Strategi Monetisasi & Metrik Keberhasilan (KPI)

### 8.1 Model Bisnis
1. **Project Commission Fee:** Potongan komisi platform sebesar 15%–20% dari total nilai proyek yang disepakati di *Quotation*.
2. **Paid 1-on-1 Mentoring:** Sesi bimbingan intensif berbayar per jam bagi mahasiswa yang ingin diajarkan langkah demi langkah cara mendesain di SolidWorks, merancang PCB, atau membedah baris kode program untuk persiapan sidang.
3. **Express / Rush Fee:** Biaya tambahan sebesar 30%–50% untuk proyek dengan tenggat waktu sangat mendesak (kurang dari 3 hari).

### 8.2 Key Performance Indicators (KPI)
* **Free-to-Paid Conversion Rate:** Persentase pengguna sesi Konsultasi Gratis yang melanjutkan ke pembayaran DP proyek (Target: $\ge 25\%$).
* **On-Time Delivery Rate:** Persentase proyek yang diselesaikan konsultan sesuai jadwal *milestone* (Target: $\ge 90\%$).
* **Dispute / Refund Rate:** Persentase proyek yang berujung komplain berat atau pembatalan (Target: $< 5\%$).