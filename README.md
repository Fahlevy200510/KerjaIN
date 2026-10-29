# KerjaIN — Platform Asistensi Rekayasa & Konsultasi Teknis (STEM)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Engineering Stack](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20ES6%20JS-1e40af)](/)

**KerjaIN** adalah platform berbasis web yang menyediakan layanan konsultasi, bimbingan teknis, dan asistensi pengerjaan proyek rekayasa bagi mahasiswa bidang teknik dan sains (STEM). Platform ini mengintegrasikan alur **Konsultasi Evaluasi Awal**, sistem transaksi bertahap (*escrow*), serta brankas proteksi file kerja (*preview vs master source file*).

---

## Layanan Inti

1. **Desain Mekanikal & Simulasi 3D:** Pemodelan 3D, *assembly*, analisis elemen hingga (FEA/CFD), dan gambar teknik 2D standar manufaktur (SolidWorks, Inventor, Fusion 360).
2. **Perancangan Skematik & Layout PCB:** Skematik rangkaian elektronika, tata letak jalur PCB multi-layer, routing sinyal impedansi terkontrol, dan berkas Gerber (Altium Designer, Eagle, EasyEDA).
3. **Sistem Tertanam, PLC & Otomasi IoT:** Pemrograman mikrokontroler (*closed-loop*), kalibrasi sensor industri, PLC & HMI/SCADA, komunikasi Modbus RS485, serta dashboard telemetri web/cloud (ESP32, STM32, Arduino, Siemens PLC).

---

## Modul & Alur Pengguna

- **Portal Publik:** Beranda interaktif, kalkulator estimasi biaya berbasis tugas kuliah, studi kasus portofolio, dan formulir booking konsultasi teknis.
- **Workspace Klien (Mahasiswa):** Pelacak tahapan proyek (*milestone tracker*), brankas file (preview gambar 3D / skematik PDF ber-*watermark* vs file master .ZIP yang terkunci oleh escrow), tiket revisi terstruktur, dan simulasi pembayaran pelunasan QRIS.
- **Workspace Konsultan (Engineer):** *Quotation Builder* otomatis, pengatur jadwal slot konsultasi, dan manajemen kunci file master.
- **Admin Back-Office:** *Project Dispatcher* (penugasan lead ke mentor spesialis), pengawasan rekening bersama (*escrow vault*), dan pusat mediasi revisi (*dispute resolution*).

---

## Struktur Berkas

```text
├── index.html                                   # Antarmuka web utama (Public, Klien, Konsultan, Admin)
├── assets/
│   ├── css/main.css                             # Sistem desain Engineering Blue & Action Orange
│   ├── js/store.js                              # State manager reaktif dengan persistensi localStorage
│   ├── js/app.js                                # Controller antarmuka & kalkulator interaktif
│   └── img/                                     # Aset render 3D CAD, PCB, dan prototipe IoT
├── prd_lengkap_platform_kerjain.md             # Dokumen Spesifikasi Kebutuhan Produk (PRD v1.0)
├── model_bisnis_dan_sistem_keuntungan_kerjain.md # Dokumen Analisis Finansial & Unit Economics
├── server.js                                    # Server HTTP lokal zero-dependency
├── test_kerjain_store.js                        # Script pengujian unit logika inti
└── vercel.json                                  # Konfigurasi deployment Vercel
```

---

## Menjalankan Secara Lokal

```bash
# Jalankan server lokal (Node.js)
node server.js

# Akses aplikasi di browser
http://localhost:3000

# Menjalankan pengujian logika unit test
node test_kerjain_store.js
```

---

## Deployment ke Vercel

Proyek ini telah dikonfigurasi dengan berkas `vercel.json` untuk *clean URLs* dan *static single-page routing*.
1. Masuk ke [vercel.com](https://vercel.com).
2. Klik **Add New Project** -> **Import** repository `Fahlevy200510/KerjaIN`.
3. Klik **Deploy**.
