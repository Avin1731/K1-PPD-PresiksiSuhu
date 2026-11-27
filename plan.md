# Rencana Implementasi Frontend (`plan.md`)

**Proyek:** Seoul Weather & Heatwave Prediction Dashboard  
**Target Stack:** React + Vite + TypeScript + Tailwind CSS + Phosphor Icons  
**Acuan Kontrak:** [API_CONTRACT.md](./API_CONTRACT.md)  
**Acuan Desain:** [design.md](./design.md)

---

## 1. Ringkasan Scope dan Arsitektur

Pengembangan berfokus penuh pada sisi **Frontend (FE)** di dalam direktori terpisah `frontend/` agar tetap bersih dari file model backend (`rf_model.joblib`) maupun folder server tim BE nantinya.

### Pilihan Teknologi

- **Framework & Bahasa:** React + TypeScript + Vite (Cepat untuk pengembangan komponen interaktif 21 input dan tipe data ketat).
- **Styling:** Tailwind CSS dengan design tokens di CSS variables agar selaras 100% dengan `design.md` (warna kanvas `#F6F7F9`, aksen `#1E40AF`, skala termal 5-level, dan `tabular-nums`).
- **Ikonografi:** `@phosphor-icons/react` (stroke weight seragam `1.75px`, hanya untuk ikon meteorologi dan aksi fungsional).
- **Visualisasi Data:**
  - `ThermalGauge`: Komponen SVG custom semi-lingkaran terkalibrasi (ringan, aksesibel dengan label `aria-valuetext`, dan skala garis batas eksak `25 °C`, `30 °C`, `33 °C`, `35 °C`).
  - `FeatureImportanceChart`: Grafik batang horizontal berbasis HTML/SVG yang terkalibrasi presisi tanpa dependensi chart eksternal yang berat.
- **CSV Client-Side:** Parser ringan UTF-8 di `utils/csvParser.ts` (untuk mode simulasi FE, validasi awal sebelum kirim ke BE, template CSV download, serta ekspor hasil batch CSV ke browser).

---

## 2. Struktur Direktori Target (`frontend/`)

```text
frontend/
├── .env.example
├── index.html                      # Memuat Source Sans 3, favicon.svg, dan script anti-flash tema
├── package.json
├── public/
│   └── favicon.svg                 # Favicon termometer Cobalt vektor
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx                     # Layout shell 3-breakpoint & state orkestrasi utama
    ├── index.css                   # Design tokens Light & Dark, base typography, tabular-nums, focus ring
    ├── types/
    │   └── prediction.ts           # Kontrak tipe persis dari API_CONTRACT.md
    ├── i18n/
    │   └── translations.ts         # Kamus dwibahasa lengkap ID / EN
    ├── data/
    │   ├── featureMeta.ts          # Metadata 21 fitur (urutan, tab, satuan, rentang split model)
    │   ├── modelMeta.ts            # Metrik evaluasi & global feature importances aktual rf_model.joblib
    │   ├── presets.ts              # 3 skenario nyata (dari backend/data/presets.json / API)
    │   └── stations.ts             # Data 25 stasiun asli (dari backend/data/stations.json / API)
    ├── utils/
    │   ├── thermalScale.ts         # Fungsi tunggal klasifikasi 5-level & warna semantik (ID/EN)
    │   ├── healthAdvisory.ts       # Pemetaan rekomendasi mitigasi kesehatan per thermal level (ID/EN)
    │   ├── validation.ts           # Validasi 21 field angka + deteksi min/max & error per tab (ID/EN)
    │   └── csvParser.ts            # Generate template CSV, validasi header 21 kolom, ekspor hasil CSV
    ├── services/
    │   ├── httpClient.ts           # Fetch wrapper dengan timeout & parsing ApiErrorResponse
    │   ├── mockPredictor.ts        # Simulator prediksi & batch CSV selama BE belum aktif
    │   └── predictionService.ts    # Switcher otomatis mock vs live HTTP (VITE_USE_MOCK)
    ├── hooks/
    │   ├── usePrediction.ts        # State loading, error, hasil single & batch prediction
    │   ├── useSessionHistory.ts    # Persistensi 5 riwayat terakhir di localStorage
    │   ├── useTheme.ts             # Persistensi Light / Dark Mode di localStorage
    │   └── useLanguage.ts          # Persistensi bahasa ID / EN di localStorage & html[lang]
    └── components/
        ├── layout/
        │   ├── DashboardHeader.tsx # Judul, toggle ID/EN, toggle Dark/Light, switcher API/Simulasi, badge koneksi
        │   ├── DashboardIntro.tsx  # Strip intro ringkas dengan 3 metrik nyata UTS
        │   ├── DashboardFooter.tsx # Footer identitas proyek UAS & link repositori GitHub
        │   └── ModeSwitcher.tsx    # Switch mode kerja: Prediksi Tunggal | Batch CSV
        ├── input/
        │   ├── StationSelector.tsx # F-UI-01 Dropdown 25 stasiun + info auto-fill 4 field geografis
        │   ├── ScenarioPresets.tsx # F-UI-02 3 tombol preset cepat
        │   ├── WeatherInputTabs.tsx# F-UI-03 Form 3 tab (Lokasi, Observasi, LDAPS)
        │   ├── PredictActionBar.tsx# F-UI-04 Tombol utama + sticky bottom bar khusus mobile
        │   └── BatchCsvPanel.tsx   # F-UI-05 Drag-and-drop CSV, template download, hasil tabel/kartu
        └── output/
            ├── ResultEmptyState.tsx# Panduan awal saat belum ada prediksi
            ├── ResultSkeleton.tsx  # Loading state menyerupai susunan Hero + Gauge + Banner
            ├── ResultErrorState.tsx# Error state dengan penyebab & tombol coba lagi
            ├── HeroPredictionCard.tsx   # F-UI-06 Angka Next_Tmax & label simulasi/live
            ├── ThermalGauge.tsx         # F-UI-07 SVG Gauge terkalibrasi 5 zona
            ├── HeatwaveBanner.tsx       # F-UI-08 Banner peringatan dini 5 level
            ├── DeltaIndicator.tsx       # F-UI-09 Indikator selisih suhu vs Present_Tmax
            ├── HealthAdvisory.tsx       # F-UI-10 Daftar rekomendasi mitigasi kesehatan
            ├── FeatureImportanceChart.tsx # F-UI-11 Grafik batang faktor penentu
            └── SessionHistoryTable.tsx  # F-UI-12 Riwayat 5 prediksi + aksi muat ulang ke form
```

---

## 3. Rencana Implementasi Bertahap (5 Fase)

### Fase 1: Inisialisasi Proyek, Design Tokens, dan Service Layer

**Tujuan:** Menyiapkan fondasi kode, tipe data kontrak, dan simulasi prediksi yang akurat terhadap rentang `rf_model.joblib`.

1. Inisialisasi proyek Vite React TypeScript di `frontend/` dan pasang `tailwindcss` serta `@phosphor-icons/react`.
2. Konfigurasikan `index.html` dengan font `Source Sans 3` dan definisikan CSS custom properties di `src/index.css` sesuai palet, radius, dan `tabular-nums` pada `design.md`.
3. Implementasikan `src/types/prediction.ts` persis mengikuti `API_CONTRACT.md` (termasuk `MODEL_FEATURE_ORDER` dengan `Slope` dan `Solar radiation`).
4. Buat `src/data/featureMeta.ts`, `src/data/modelMeta.ts` (berisi angka importances aktual dari `rf_model.joblib`), `src/data/presets.ts` (salin dari `backend/data/presets.json`), dan `src/data/stations.ts` (salin dari `backend/data/stations.json` berisi 25 stasiun asli dari dataset UTS). Saat mode live aktif, FE juga dapat menyegarkan daftar dari `GET /api/stations` dan `GET /api/presets`.
5. Bangun `src/utils/thermalScale.ts` dan `src/utils/healthAdvisory.ts` agar seluruh UI memakai satu sumber ambang batas (`<25`, `25-29.9`, `30-32.9`, `33-34.9`, `>=35`).
6. Bangun `src/services/mockPredictor.ts`, `src/services/httpClient.ts`, dan `src/services/predictionService.ts`. Pastikan `mockPredictor` menghitung perkiraan suhu dalam rentang leaf aktual `17.4 - 37.8 °C` menggunakan bobot fitur dominan (`LDAPS_Tmax_lapse`, `Present_Tmax`, tutupan awan, radiasi, dan curah hujan).

**Kriteria Selesai Fase 1:** Build TypeScript lolos tanpa error (`npm run build`), unit/smoke check fungsi `thermalScale`, `validation`, dan `mockPredictor` menghasilkan payload sesuai `SinglePredictResponse`.

---

### Fase 2: Core Dashboard (Tahap 1 PRD)

**Tujuan:** Membangun alur utama pengisian 21 parameter hingga tampilnya suhu prediksi dan status gelombang panas.

1. Buat `DashboardHeader` dan `ModeSwitcher` (Prediksi Tunggal vs Batch CSV) dengan struktur yang tidak memiliki tautan mati (`R-24`).
2. Bangun `StationSelector` (`F-UI-01`) yang mengisi otomatis `lat`, `lon`, `DEM`, `Slope`, serta mendeteksi apabila pengguna mengubah salah satu nilai geografis secara manual.
3. Bangun `ScenarioPresets` (`F-UI-02`) dengan 3 tombol (*Normal Musim Panas*, *Gelombang Panas*, *Hujan dan Berawan*) tanpa emoji dekoratif.
4. Bangun `WeatherInputTabs` (`F-UI-03`) dengan dukungan keyboard WAI-ARIA Tabs (`ArrowLeft`/`ArrowRight`), badge jumlah error per tab, satuan eksplisit (`Wh/m2` untuk `Solar radiation`), dan validasi rentang angka (`src/utils/validation.ts`).
5. Bangun `PredictActionBar` (`F-UI-04`) dengan perilaku responsif: duduk di bawah form pada desktop/tablet, dan menjadi sticky action bar dengan safe-area padding pada viewport `< 720px`.
6. Bangun `HeroPredictionCard` (`F-UI-06`), `HeatwaveBanner` (`F-UI-08`), serta tiga state wajib `ResultEmptyState`, `ResultSkeleton`, dan `ResultErrorState` (`R-27`).

**Kriteria Selesai Fase 2:** Pengguna dapat memilih stasiun, memakai preset, mengedit 21 fitur di 3 tab, memicu prediksi, melihat validasi jika ada angka invalid, dan melihat hasil `Next_Tmax` + banner peringatan.

---

### Fase 3: Visualisasi, XAI, dan Mitigasi (Tahap 2 PRD)

**Tujuan:** Melengkapi sisi kanan dashboard dengan alat baca visual, konteks selisih suhu, saran kesehatan, dan penjelasan model.

1. Bangun `ThermalGauge` (`F-UI-07`) menggunakan SVG semi-lingkaran dengan 5 segmen warna, tanda batas angka (`25`, `30`, `33`, `35 °C`), dan transisi posisi jarum `200ms ease-out`.
2. Bangun `DeltaIndicator` (`F-UI-09`) yang menampilkan selisih `Next_Tmax - Present_Tmax` beserta arah kenaikan/penurunan.
3. Bangun `HealthAdvisory` (`F-UI-10`) yang merender daftar saran mitigasi warga spesifik untuk tiap tingkat status termal.
4. Bangun `FeatureImportanceChart` (`F-UI-11`) dengan judul berbentuk pertanyaan (*"Variabel apa yang paling memengaruhi prediksi model?"*), menampilkan 7 faktor teratas dari `rf_model.joblib` beserta nilai input saat ini untuk membantu penjelasan presentasi.

**Kriteria Selesai Fase 3:** Seluruh komponen kanan tersinkron pada 1 skala warna termal yang sama dan tetap rapi di layout 1 kolom mobile, 2 kolom bertumpuk tablet, maupun 2 kolom asimetris desktop.

---

### Fase 4: Batch CSV dan Session History (Tahap 3 PRD)

**Tujuan:** Menyelesaikan fitur analitik batch dan perbandingan antar-skenario sesi.

1. Bangun `src/utils/csvParser.ts` untuk:
   - Mengunduh file `template_prediksi_seoul.csv` berisi header 21 kolom eksak dan 3 baris contoh preset.
   - Memvalidasi file unggahan di browser sebelum dikirim (cek ekstensi `.csv`, batas ukuran, dan kelengkapan 21 kolom fitur).
   - Mengekspor hasil `BatchPredictResponse.rows` menjadi file `.csv` siap unduh (`Unduh Hasil CSV`).
2. Bangun `BatchCsvPanel` (`F-UI-05`) dengan area drag-and-drop yang mudah diakses keyboard (`Enter`/`Space`), ringkasan metrik batch (`min`, `max`, `avg`, jumlah Siaga/Bahaya), dan daftar hasil yang otomatis beralih dari `<table>` (desktop/tablet) ke stacked row cards (`< 720px`).
3. Bangun `useSessionHistory` dan `SessionHistoryTable` (`F-UI-12`) untuk menyimpan 5 prediksi terakhir di `localStorage` lengkap dengan fitur **"Muat Ulang Input"** dan **"Hapus Riwayat"**.

**Kriteria Selesai Fase 4:** Unggah CSV contoh menghasilkan tabel/kartu hasil dan bisa diunduh kembali sebagai CSV baru; riwayat 5 sesi terakhir bertahan saat refresh dan bisa dimuat ulang ke form.

---

### Fase 5 & Penyempurnaan Pasca-Audit (Selesai Terverifikasi)

**Tujuan:** Memastikan seluruh UI memenuhi aturan `antislop` (DURING, UI, Layoutmobile) dan `impeccable` sebelum dipakai untuk integrasi BE maupun demo.

1. **Verifikasi Build & Runtime (Selesai):** `npm run build` (`tsc -b && vite build`) lolos tanpa error TypeScript dan aplikasi berjalan bersih di browser tanpa console error.
2. **Uji Responsivitas 3 Breakpoint (`R-03`, Selesai):**
   - Lebar `375x812` (Compact): nol *horizontal scroll*, seluruh tombol/tab termasuk kontrol header memenuhi target sentuh `>= 44px`, dan sticky bottom bar tidak menutupi footer maupun riwayat terakhir.
   - Lebar `768x1024` (Medium): grid 2 kolom di dalam form dan hasil bekerja seimbang tanpa clipping.
   - Lebar `1280x800` (Wide): 2 kolom `46fr / 54fr` proporsional dengan `DashboardIntro` dan kedua panel utama terlihat di atas lipatan layar.
3. **Uji Aksesibilitas Keyboard & Kontras (`R-25`, `R-32`, Selesai):** Navigasi penuh dengan `Tab`, `Shift+Tab`, `ArrowLeft`/`ArrowRight`, `Enter`, dan `Space`, *focus ring* jelas, serta kedua tema Light & Dark lolos WCAG AA (`>= 5.71:1`).
4. **Click-Through Audit & Detector (`R-35`, Selesai):** Seluruh elemen interaktif lolos uji langsung di browser dan `impeccable detect --json frontend/src` mengembalikan `0` temuan (`[]`).
5. **Penambahan Pasca-Fase 5 (Selesai):** `DashboardIntro`, `DashboardFooter`, `public/favicon.svg`, toggle **Dark Mode** (`useTheme.ts`), dan dukungan dwibahasa **ID / EN** penuh (`useLanguage.ts` & `src/i18n/translations.ts`).

---

## 4. Panduan Serah Terima & Integrasi Backend (Plug-and-Play)

Setelah `backend/app.py` (atau server backend final tim BE) aktif sesuai [API_CONTRACT.md](./API_CONTRACT.md), proses penyambungan ke FE dilakukan dengan 4 langkah singkat:

1. **Sinkronisasi Data Referensi:** Pastikan `frontend/src/data/stations.ts` dan `frontend/src/data/presets.ts` sudah memuat data asli dari `backend/data/stations.json` dan `backend/data/presets.json` (serta terhubung dengan `GET /api/stations` dan `GET /api/presets`).
2. **Konfigurasi Environment:** Salin `.env.example` menjadi `.env` dan ubah:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_USE_MOCK=false
   ```
3. **Verifikasi Kontrak Lapangan:**
   - Jalankan `python backend/app.py` di terminal terpisah dan pastikan `GET /api/health` mengembalikan `model_loaded: true`.
   - Cek `GET /api/health`, `GET /api/model-info`, `GET /api/stations`, dan `GET /api/presets` dari tab Network browser (pastikan tidak ada error CORS).
   - Kirim 1 skenario preset melalui `POST /api/predict` dan pastikan `predicted_tmax` cocok (`28.95 °C` untuk `normal`, `36.54 °C` untuk `heatwave`, `20.05 °C` untuk `rain`).
   - Uji unggah `template_prediksi_seoul.csv` melalui `POST /api/predict/batch` dan verifikasi ringkasan statistik serta format error baris gagal.
4. **Siap Demo:** Setelah `VITE_USE_MOCK=false` terhubung sukses, penanda *"Mode Simulasi FE"* di header otomatis berganti menjadi *"API Terhubung"* dan nilai prediksi berasal 100% dari `rf_model.joblib`.
