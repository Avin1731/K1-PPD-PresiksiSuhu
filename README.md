# Seoul Weather & Heatwave Prediction Dashboard

**Proyek UAS Praktikum Penambangan Data, D4 Rekayasa Perangkat Lunak SV UGM**

Aplikasi web berbasis **Single Page Dashboard** untuk memprediksi suhu maksimum esok hari (`Next_Tmax`) di Kota Seoul sekaligus menyajikan sistem peringatan dini gelombang panas (*heatwave early warning*) menggunakan model *Machine Learning* hasil proyek UTS (`rf_model.joblib`).

---

## Ringkasan Fitur Utama

### Kontrol & Input Data (`F-UI-01` s.d. `F-UI-05`)
- **Pemilih 25 Stasiun Pengamatan Cuaca (`F-UI-01`):** Mengisi otomatis 4 parameter geografis stasiun (`lat`, `lon`, `DEM`, `Slope`).
- **3 Skenario Preset Cepat (`F-UI-02`):** Pengisian 1-klik untuk kondisi *Normal Musim Panas*, *Gelombang Panas*, serta *Hujan dan Berawan*.
- **Formulir 21 Parameter dalam 3 Tab (`F-UI-03`):** Mengelompokkan parameter ke dalam *Lokasi & Topografi*, *Observasi Hari Ini*, dan *Prakiraan Model LDAPS*.
- **Prediksi Instan (`F-UI-04`):** Validasi input 21 fitur dan kalkulasi prediksi tunggal.
- **Batch CSV Prediction (`F-UI-05`):** Unggah berkas `.csv` multi-baris, unduh template CSV standar, lihat ringkasan statistik, dan ekspor hasil prediksi ke CSV.

### Hasil & Analitik (`F-UI-06` s.d. `F-UI-12`)
- **Kartu Metrik Utama (`F-UI-06`):** Menampilkan `Next_Tmax`, stasiun aktif, waktu inferensi, dan status sumber (*API Terhubung* atau *Mode Simulasi FE*).
- **Calibrated Thermal Gauge (`F-UI-07`) & Banner Peringatan Dini (`F-UI-08`):** Terkalibrasi dalam satu skala 5-level yang seragam:

| Status (`heatwave_status`) | Rentang `Next_Tmax` | Kategori UI |
|:---|:---|:---|
| `cool` | `< 25.0 °C` | Sejuk |
| `normal` | `25.0 - 29.9 °C` | Nyaman |
| `warm` | `30.0 - 32.9 °C` | Hangat (Waspada) |
| `advisory` | `33.0 - 34.9 °C` | Siaga Gelombang Panas (KMA Advisory) |
| `warning` | `>= 35.0 °C` | Bahaya Gelombang Panas Ekstrem (KMA Warning) |

- **Indikator Selisih Suhu (`F-UI-09`):** Membandingkan `Next_Tmax` terhadap `Present_Tmax` hari ini (`Delta T`).
- **Rekomendasi Kesehatan Warga (`F-UI-10`):** Saran mitigasi praktis yang menyesuaikan 5 tingkat status termal.
- **Grafik Faktor Penentu (`F-UI-11`):** Visualisasi bobot *feature importance* aktual dari `rf_model.joblib` beserta nilai input aktif pengguna.
- **Riwayat Prediksi Sesi (`F-UI-12`):** Menyimpan 5 prediksi terakhir di browser (`localStorage`) lengkap dengan tombol muat ulang input.

---

## Arsitektur Monorepo

Repository menggunakan pendekatan **1 monorepo** dengan pemisahan folder kerja yang tegas antara Frontend (`frontend/`) dan Backend (`backend/`):

```text
PrediksiSuhu/
├── .gitignore                      # Abaikan node_modules/, dist/, .env, .venv/, __pycache__/
├── PRD.md                          # Spesifikasi fitur & produk
├── API_CONTRACT.md                 # Kontrak REST API FE <-> BE & tipe TypeScript
├── design.md                       # Sistem desain UI, skala termal 5-level & responsivitas
├── plan.md                         # Rencana implementasi bertahap Frontend
├── README.md                       # Panduan umum monorepo
├── rf_model.joblib                 # Model Random Forest terlatih (~49.5 MB)
│
├── frontend/                       # Target aplikasi FE (React + Vite + Tailwind + TypeScript)
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── types/                  # Kontrak TypeScript (prediction.ts)
│       ├── data/                   # Metadata model, fitur, preset, & 25 stasiun
│       ├── utils/                  # Skala termal, validasi 21 fitur, parser CSV
│       ├── services/               # httpClient, mockPredictor, & predictionService switcher
│       ├── hooks/                  # usePrediction & useSessionHistory
│       └── components/             # Komponen layout, input (F-UI-01..05), & output (F-UI-06..12)
│
└── backend/                        # Server BE Flask + data asli dataset UTS
    ├── requirements.txt
    ├── app.py                      # Server API (/api/health, /api/model-info, /api/stations, /api/presets, /api/predict, /api/predict/batch)
    └── data/
        ├── stations.json           # 25 stasiun pengamatan cuaca asli (lat, lon, DEM, Slope)
        └── presets.json            # 3 skenario nyata teruji terhadap rf_model.joblib
```

---

## Dokumen Teknis

- **[PRD.md](./PRD.md):** Ringkasan fitur, wireframe, metrik UTS, spesifikasi 21 variabel, dan tahapan pengerjaan.
- **[API_CONTRACT.md](./API_CONTRACT.md):** Spesifikasi lengkap endpoint REST API, skema JSON request/response, standar error `4xx/5xx`, tipe TypeScript, dan daftar pertanyaan integrasi FE-BE.
- **[design.md](./design.md):** Panduan arah visual (*Light Editorial Meteorology*), token warna terverifikasi WCAG AA, tipografi `tabular-nums`, dan aturan responsif 3-breakpoint.
- **[plan.md](./plan.md):** Roadmap teknis pembangunan proyek `frontend/` dalam 5 fase hingga verifikasi kualitas dan panduan *plug-and-play* ke backend.

---

## Spesifikasi Ringkas Model (`rf_model.joblib`)

- **Algoritma:** `RandomForestRegressor` (100 Decision Trees, `random_state=42`, `scikit-learn 1.9.1`, tanpa scaler tambahan)
- **Target Output:** `Next_Tmax` (°C, rentang *leaf* latih `17.4 - 37.8 °C`)
- **Metrik Evaluasi UTS:** $R^2 = 0.8933$, MAE $= 0.7430^\circ\text{C}$, RMSE $= 1.0023^\circ\text{C}$
- **Catatan Penting 21 Fitur Model:**
  1. Model **tidak memakai** kolom `station`; dropdown stasiun di UI berfungsi mengisi otomatis `lat`, `lon`, `DEM`, dan **`Slope`** (`0.116 - 4.954`).
  2. Kolom radiasi menggunakan nama eksak **`Solar radiation`** (dengan spasi) dalam satuan **Wh/m2** (rentang split `4389.010 - 5990.307`).
  3. Urutan 21 `feature_names_in_` dan *global feature importances* aktual tersedia lengkap pada [API_CONTRACT.md](./API_CONTRACT.md).

---

## Panduan Menjalankan Proyek

### 1. Frontend (`frontend/`, setelah Fase 1 selesai diinisialisasi)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Konfigurasi `.env` frontend:
- **Mode Simulasi FE (tanpa backend):** set `VITE_USE_MOCK=true`. Seluruh alur UI berjalan dengan simulator lokal.
- **Mode Live API (terhubung ke backend):** set `VITE_USE_MOCK=false` dan arahkan `VITE_API_BASE_URL=http://localhost:8000` (atau port server Flask/FastAPI tim BE).

### 2. Backend (`backend/`, sudah siap dijalankan)

Server backend berbasis **Flask** tersedia di `backend/app.py` (port default `8000`) dan otomatis memuat `rf_model.joblib`, `backend/data/stations.json` (25 stasiun asli), serta `backend/data/presets.json` (3 skenario nyata).

```bash
pip install -r backend/requirements.txt
python backend/app.py
```

Setelah berjalan, verifikasi kesiapan model melalui `http://localhost:8000/api/health`. Daftar endpoint yang disediakan sesuai [API_CONTRACT.md](./API_CONTRACT.md):
- `GET /api/health`
- `GET /api/model-info`
- `GET /api/stations`
- `GET /api/presets`
- `POST /api/predict`
- `POST /api/predict/batch`

---

## Alur Kerja Git Tim (FE & BE)

Agar pengerjaan paralel tidak menimbulkan konflik merge:
- **Tim FE** bekerja pada branch fitur di dalam folder `frontend/` (misal `feat/fe-dashboard`).
- **Tim BE** bekerja pada branch fitur di dalam folder `backend/` (misal `feat/be-flask-api`).
- Perubahan kontrak API atau data referensi di root (`API_CONTRACT.md`, `PRD.md`) disepakati bersama sebelum di-merge ke `main`.
