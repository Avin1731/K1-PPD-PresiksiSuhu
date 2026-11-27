# Rangkuman Fitur & Desain Antarmuka (UI) Website Prediksi Suhu Seoul
**Proyek UAS Praktikum Penambangan Data, D4 Rekayasa Perangkat Lunak SV UGM**

Dokumen ini merupakan panduan spesifikasi fungsional, antarmuka pengguna (*UI/UX Specifications*), serta kebutuhan teknis untuk pengembangan website *dashboard* prediksi suhu harian dan sistem peringatan dini gelombang panas (*heatwave*) Kota Seoul menggunakan model *Machine Learning* yang telah dilatih pada proyek UTS (`rf_model.joblib`).

Dokumen pendamping teknis tersedia pada:
- Kontrak API Frontend-Backend: [API_CONTRACT.md](./API_CONTRACT.md)
- Spesifikasi Desain & Sistem UI: [design.md](./design.md)
- Rencana Implementasi Frontend: [plan.md](./plan.md)

---

## 1. Konsep Utama & Sketsa Antarmuka (Wireframe Layar)

Website dirancang menggunakan konsep **Single Page Dashboard** yang bersih, terkalibrasi, dan mudah dipindai (*Operational Analytical Tool*). Pada layar desktop, area kerja dibagi menjadi dua kolom asimetris: **Sisi Kiri untuk Kontrol Input Data (46%)** dan **Sisi Kanan untuk Visualisasi Hasil Prediksi (54%)**, dilengkapi area riwayat dan batch prediction di bagian bawah.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SEOUL WEATHER & HEATWAVE PREDICTION DASHBOARD                         [Mode: Simulasi FE / API] │
├────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│            SISI KIRI: INPUT DATA               │          SISI KANAN: HASIL & PREDIKSI          │
├────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ 1. [Dropdown] Stasiun Cuaca (1 - 25)           │ 1. [Hero Card] Suhu Prediksi: 34.5 °C          │
│    (Lat, Lon, DEM, & Slope terisi otomatis)    │    (Status: Siaga Gelombang Panas)             │
│                                                │                                                │
│ 2. [3 Tombol Preset Skenario Cepat]:           │ 2. [Calibrated Thermal Gauge (15 - 40 °C)]     │
│    [Normal Summer] [Heatwave] [Hujan/Berawan]  │    (5 zona warna sinkron + batas 25/30/33/35)  │
│                                                │                                                │
│ 3. [Form Angka Cuaca Hari Ini (21 Fitur)]      │ 3. [Banner Peringatan Dini Heatwave]           │
│    • Tab 1: Lokasi & Topografi (4 fitur)       │    "SIAGA GELOMBANG PANAS (33.0 - 34.9 °C)"    │
│    • Tab 2: Observasi Hari Ini (3 fitur)       │                                                │
│    • Tab 3: Prakiraan Model LDAPS (14 fitur)   │ 4. [Indikator Selisih Suhu Delta T]            │
│                                                │    "Naik +2.3 °C dibanding hari ini"           │
│ 4. [Tombol Utama]                              │                                                │
│    "Prediksi Suhu Esok Hari"                   │ 5. [Kotak Saran & Mitigasi Kesehatan Warga]    │
│                                                │    • Cukupi konsumsi air putih minimal 2 liter │
│ 5. [Mode Tab / Panel Batch CSV Upload]         │    • Hindari aktivitas luar jam 12.00 - 15.00  │
│    (Unggah CSV, template, & unduh hasil CSV)   │                                                │
│                                                │ 6. [Grafik Batang Faktor Penentu Cuaca]        │
│                                                │    (Feature importance aktual rf_model.joblib)  │
└────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

---

## 2. Rincian Fitur UI: Sisi Kiri (Area Input & Kontrol Data)

| Kode Fitur | Nama Komponen UI | Deskripsi & Tampilan | Manfaat Bagi Pengguna / Presentasi |
|:---:|:---|:---|:---|
| **F-UI-01** | **Dropdown Pemilih Stasiun (*Smart Auto-fill*)** | Menu *dropdown* berisi 25 stasiun pengamatan cuaca resmi di Kota Seoul (Stasiun 1 - 25). Memilih stasiun otomatis mengisi **4 field geografis**: garis lintang (`lat`), garis bujur (`lon`), ketinggian (`DEM`), dan kemiringan lereng (`Slope`). Nilai `station` tidak dikirim sebagai fitur model, melainkan alat bantu pengisian cepat. | Pengguna tidak perlu mencari atau menghafal 4 koordinat geografis distrik Seoul secara manual. |
| **F-UI-02** | **3 Tombol Skenario Cepat (*1-Click Quick Preset*)** | Tiga tombol pintas dengan ikon meteorologi di atas formulir:<br>• **Normal Musim Panas**: Parameter musim panas standar (~29 °C).<br>• **Gelombang Panas**: Radiasi tinggi dan tutupan awan rendah (>35 °C).<br>• **Hujan dan Berawan**: Tutupan awan tinggi, kelembapan tinggi, curah hujan aktif (~21 °C). | Sangat krusial saat demo 10 menit di hadapan dosen/penguji agar tidak membuang waktu mengetik 21 angka satu per satu. |
| **F-UI-03** | **Formulir Terkelompok (3 Tab)** | Membagi 21 parameter input eksak model ke dalam 3 panel:<br>1. *Lokasi & Topografi* (4 fitur): `lat`, `lon`, `DEM`, `Slope`.<br>2. *Observasi Hari Ini* (3 fitur): `Present_Tmax`, `Present_Tmin`, `Solar radiation` ($\text{Wh/m}^2$).<br>3. *Prakiraan LDAPS* (14 fitur): suhu maksimum/minimum lapse (`LDAPS_Tmax_lapse`, `LDAPS_Tmin_lapse`), kelembapan relatif (`LDAPS_RHmin`, `LDAPS_RHmax`), kecepatan angin (`LDAPS_WS`), fluks panas laten (`LDAPS_LH`), tutupan awan 4 kuadran (`LDAPS_CC1 - CC4`), dan curah hujan 4 kuadran (`LDAPS_PPT1 - PPT4`). | Tampilan formulir tetap rapi, jelas, dan menghindari *cognitive overload*. |
| **F-UI-04** | **Tombol Aksi Utama (*Primary Predict Button*)** | Tombol aksi spesifik: *"Prediksi Suhu Esok Hari"*. Ketika diklik, input divalidasi lalu model melakukan kalkulasi secara instan (< 10 ms di backend). Pada viewport mobile (`< 720px`), tombol tersedia sebagai *sticky bottom action bar*. | Memberikan interaksi yang responsif dan akses cepat dari tab input mana pun. |
| **F-UI-05** | **Kotak Unggah Berkas CSV (*Batch Prediction*)** | Area *drag-and-drop* dan pemilih file `.csv` (batas maksimal `5 MB` / `5000` baris) beserta tombol **Unduh Template CSV**. Hasil prediksi muncul dalam ringkasan statistik dan tabel interaktif (menjadi daftar kartu pada layar mobile) lengkap dengan tombol **Unduh Hasil CSV**. | Menunjukkan kapabilitas sistem memproses data prakiraan multi-hari/stasiun sekaligus. |

---

## 3. Rincian Fitur UI: Sisi Kanan (Area Hasil & Output)

| Kode Fitur | Nama Komponen UI | Deskripsi & Tampilan | Manfaat Bagi Pengguna / Presentasi |
|:---:|:---|:---|:---|
| **F-UI-06** | **Kartu Metrik Utama (*Hero Prediction Card*)** | Kartu utama dengan angka `tabular-nums` berukuran besar untuk menampilkan prediksi suhu maksimum esok hari (`Next_Tmax`), misalnya **34.5 °C**, nama stasiun, waktu inferensi, serta keterangan sumber (*API Model* atau *Mode Simulasi FE*). | Informasi paling vital langsung terbaca dalam 1 detik pertama setelah kalkulasi. |
| **F-UI-07** | **Visual *Calibrated Thermal Gauge*** | Komponen gauge SVG semi-lingkaran (`15 - 40 °C`) dengan **5 zona warna terpadu** dan garis batas suhu eksplisit:<br>• Biru (`< 25.0 °C`): Sejuk<br>• Hijau (`25.0 - 29.9 °C`): Nyaman<br>• Kuning/Amber (`30.0 - 32.9 °C`): Hangat (Waspada)<br>• Oranye (`33.0 - 34.9 °C`): Siaga Gelombang Panas<br>• Merah (`>= 35.0 °C`): Bahaya Gelombang Panas Ekstrem | Memberikan alat baca batas termal yang presisi dan konsisten dengan status banner peringatan. |
| **F-UI-08** | **Banner Peringatan Dini (*Heatwave Early Warning*)** | Banner status otomatis yang tersinkronisasi penuh dengan 5 level gauge:<br>• Biru (`< 25.0 °C`): *Kondisi Sejuk*<br>• Hijau (`25.0 - 29.9 °C`): *Kondisi Normal & Nyaman*<br>• Kuning/Amber (`30.0 - 32.9 °C`): *Waspada Peningkatan Suhu*<br>• Oranye (`33.0 - 34.9 °C`): *Siaga Gelombang Panas (KMA Advisory)*<br>• Merah (`>= 35.0 °C`): *Bahaya Gelombang Panas Ekstrem (KMA Warning)* | Menjadikan aplikasi berfungsi sebagai sistem mitigasi peringatan dini yang konsisten tanpa perbedaan ambang antar komponen. |
| **F-UI-09** | **Indikator Selisih Suhu ($\Delta T$ vs Hari Ini)** | Menampilkan perbandingan suhu prediksi esok hari dengan suhu observasi hari ini (`Present_Tmax`):<br>• *"Naik +2.3 °C dibanding hari ini"*<br>• *"Turun -1.5 °C dibanding hari ini"* | Memberi konteks perubahan suhu harian yang mudah dipahami pengguna umum. |
| **F-UI-10** | **Kotak Rekomendasi Kesehatan Warga (*Health Advisory*)** | Daftar saran praktis otomatis sesuai 5 level `heatwave_status`, seperti anjuran hidrasi tubuh minimal 2 liter, penggunaan tabir surya, dan imbauan membatasi aktivitas luar ruang pada pukul 12.00 - 15.00. | Menambah nilai guna aplikasi bagi keselamatan warga. |
| **F-UI-11** | **Grafik Faktor Penentu (*Feature Importance Bar Chart*)** | Diagram batang horizontal dengan judul pertanyaan *"Variabel apa yang paling memengaruhi prediksi model?"*, menampilkan 7 fitur teratas dari bobot aktual `rf_model.joblib` (`LDAPS_Tmax_lapse` 69.52%, `Present_Tmax` 5.37%, `LDAPS_CC1` 3.06%, dst.) beserta nilai input aktif pengguna. | Memenuhi aspek *Explainable AI* (XAI) yang terverifikasi langsung dari struktur model terlatih. |
| **F-UI-12** | **Tabel Riwayat Prediksi Sesi (*Session History Log*)** | Daftar riwayat di bagian bawah yang mencatat 5 prediksi terakhir pada browser (`localStorage`), lengkap dengan tombol **Muat Ulang Input** untuk mengembalikan 21 parameter skenario ke formulir. | Memudahkan perbandingan cepat beberapa skenario cuaca saat sesi demo. |

---

## 4. Spesifikasi Model Machine Learning yang Dihubungkan

* **File Model**: `rf_model.joblib`
* **Algoritma**: `RandomForestRegressor` (100 Decision Trees, `random_state=42`, `scikit-learn 1.9.1`, tanpa scaler tambahan)
* **Target Output**: `Next_Tmax` (Derajat Celsius, °C; rentang leaf latih `17.4 - 37.8 °C`)
* **Kinerja Evaluasi (Hasil UTS)**:
  * Koefisien Determinasi ($R^2$): **0.8933** (89.33%)
  * *Mean Absolute Error* (MAE): **0.7430 °C**
  * *Root Mean Squared Error* (RMSE): **1.0023 °C**
* **Kecepatan Inferensi**: < 10 ms per *single prediction*

---

## 5. Daftar 21 Variabel Input Model (Sesuai `feature_names_in_`)

Backend wajib menyusun vektor/DataFrame input persis sesuai urutan dan nama kolom berikut:

| No | Nama Fitur Eksak | Deskripsi | Rentang Split Aktual (`rf_model.joblib`) | Satuan |
|:---:|:---|:---|:---:|:---:|
| 1 | `Present_Tmax` | Suhu Maksimum Hari Ini | `20.050 - 37.550` | °C |
| 2 | `Present_Tmin` | Suhu Minimum Hari Ini | `14.450 - 29.750` | °C |
| 3 | `LDAPS_RHmin` | Kelembapan Relatif Minimal LDAPS | `21.567 - 95.816` | % |
| 4 | `LDAPS_RHmax` | Kelembapan Relatif Maksimal LDAPS | `59.832 - 99.983` | % |
| 5 | `LDAPS_Tmax_lapse` | Estimasi Suhu Maksimal LDAPS | `17.730 - 38.085` | °C |
| 6 | `LDAPS_Tmin_lapse` | Estimasi Suhu Minimal LDAPS | `14.372 - 29.524` | °C |
| 7 | `LDAPS_WS` | Kecepatan Angin Permukaan LDAPS | `3.197 - 19.885` | m/s |
| 8 | `LDAPS_LH` | Fluks Panas Laten Permukaan LDAPS | `4.555 - 188.139` | $W/m^2$ |
| 9 | `LDAPS_CC1` | Tutupan Awan Jam 00:00 - 06:00 | `0.000 - 0.965` | Rasio |
| 10 | `LDAPS_CC2` | Tutupan Awan Jam 06:00 - 12:00 | `0.000 - 0.955` | Rasio |
| 11 | `LDAPS_CC3` | Tutupan Awan Jam 12:00 - 18:00 | `0.000 - 0.977` | Rasio |
| 12 | `LDAPS_CC4` | Tutupan Awan Jam 18:00 - 24:00 | `0.000 - 0.971` | Rasio |
| 13 | `LDAPS_PPT1` | Curah Hujan Jam 00:00 - 06:00 | `0.000 - 21.651` | mm |
| 14 | `LDAPS_PPT2` | Curah Hujan Jam 06:00 - 12:00 | `0.000 - 21.449` | mm |
| 15 | `LDAPS_PPT3` | Curah Hujan Jam 12:00 - 18:00 | `0.000 - 13.865` | mm |
| 16 | `LDAPS_PPT4` | Curah Hujan Jam 18:00 - 24:00 | `0.000 - 15.719` | mm |
| 17 | `lat` | Garis Lintang Stasiun | `37.463 - 37.632` | °N |
| 18 | `lon` | Garis Bujur Stasiun | `126.832 - 127.117` | °E |
| 19 | `DEM` | Ketinggian dari Permukaan Laut | `13.979 - 210.421` | meter |
| 20 | `Slope` | Kemiringan Lereng Lokasi Stasiun | `0.116 - 4.954` | derajat/rasio |
| 21 | `Solar radiation` | Akumulasi Radiasi Sinar Matahari (memakai spasi) | `4389.010 - 5990.307` | $Wh/m^2$ |

Catatan: Parameter `station` (1 - 25) digunakan di UI (`F-UI-01`) sebagai pemilih *auto-fill* ke 4 field geografis (`lat`, `lon`, `DEM`, `Slope`) dan sebagai metadata riwayat, bukan sebagai kolom input model.

---

## 6. Arsitektur Deployment & Tech Stack

* **Frontend (`frontend/`):** React + Vite + Tailwind CSS + TypeScript, memisahkan layer layanan di `src/services/predictionService.ts`.
* **Backend & Model Serving (`backend/app.py`):** Python REST API berbasis **Flask** (port default `8000`) yang memuat `rf_model.joblib` sekali saat startup, menyajikan data asli ekstraksi dataset UTS (`backend/data/stations.json` dan `backend/data/presets.json`), serta menyediakan endpoint:
  * `GET /api/health` (kesiapan server & model)
  * `GET /api/model-info` (metadata model & *feature importance* aktual)
  * `GET /api/stations` (daftar 25 stasiun asli Seoul dari dataset UTS)
  * `GET /api/presets` (3 skenario preset nyata teruji terhadap `rf_model.joblib`)
  * `POST /api/predict` (prediksi tunggal 21 fitur)
  * `POST /api/predict/batch` (prediksi massal file `.csv`)
* **Dukungan Mode Simulasi FE (`VITE_USE_MOCK=true`) & Live API (`VITE_USE_MOCK=false`):** FE dapat langsung diuji terhadap `backend/app.py` lokal maupun berjalan mandiri memakai *mock service* lokal dengan penanda transparan di UI (*"Mode Simulasi FE"*).

---

## 7. Kebutuhan Non-Fungsional, Validasi & Error Handling

* **Responsivitas 3-State:** Antarmuka beradaptasi untuk **Compact (`< 720px`)** (1 kolom, target sentuh minimum `44 x 44 px`, sticky bottom action bar, tabel menjadi kartu), **Medium (`720 - 1099px`)** (grid 2 kolom terstruktur dalam panel), dan **Wide (`>= 1100px`)** (dashboard 2 kolom `46% / 54%`).
* **UI States Wajib:** Panel hasil dan batch CSV menyediakan *Empty State* (panduan mulai), *Loading State* (skeleton terstruktur), dan *Error State* (pesan penyebab spesifik + tombol *Coba Lagi*).
* **Validasi Input & Batch CSV:**
  * Seluruh 21 parameter tunggal divalidasi sebagai angka valid (*finite*) dan memberi peringatan rentang jika keluar dari distribusi model.
  * Batch CSV memeriksa ekstensi `.csv`, batas ukuran `5 MB` / `5000` baris, kelengkapan 21 kolom wajib, serta melaporkan baris yang gagal/mengandung `NaN` per nomor baris tanpa menjatuhkan keseluruhan hasil valid.
* **Aksesibilitas & Kontras:** Mendukung navigasi keyboard penuh (`Tab`, `Shift+Tab`, `ArrowLeft`/`ArrowRight` pada tab, `Enter`/`Space`) dengan *focus ring* jelas serta rasio kontras minimum **WCAG AA** (`>= 4.5:1`).

---

## 8. Tahapan Pengerjaan & Prioritas Fitur

```
[Tahap 1: Core Deployment & Fondasi FE (Wajib)]
├── Setup React + Vite + Tailwind + Service Layer (Mock & Live API)
├── Backend Flask/FastAPI Load Model rf_model.joblib
├── Layout Dashboard 2 Kolom (Input Kiri 46%, Hasil Kanan 54%)
├── Dropdown 25 Stasiun Auto-fill 4 Field Geografis (F-UI-01)
├── Form 3 Tab 21 Parameter Model Aktual (F-UI-03)
├── 3 Tombol Preset Skenario Cepat (F-UI-02)
└── Kartu Angka Suhu & Peringatan Heatwave 5-Level (F-UI-06 & F-UI-08)

[Tahap 2: Visual & UX Enhancement (Sangat Dianjurkan)]
├── Komponen Visual Calibrated Thermal Gauge 5 Zona (F-UI-07)
├── Indikator Selisih Delta Suhu (F-UI-09)
├── Rekomendasi Kesehatan Masyarakat (F-UI-10)
└── Grafik Feature Importance Aktual Model (F-UI-11)

[Tahap 3: Fitur Unggulan UAS & Integrasi (Nilai Plus)]
├── Batch CSV Upload, Template CSV & Unduh Hasil (F-UI-05)
├── Log Riwayat Prediksi Sesi + Muat Ulang Input (F-UI-12)
└── Integrasi Penuh Endpoint RESTful API (/api/health, /api/model-info, /api/stations, /api/presets, /api/predict, /api/predict/batch)
```
