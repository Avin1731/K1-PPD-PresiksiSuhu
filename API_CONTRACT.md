# Kontrak API Sisi Frontend (FE-BE API Contract)

**Proyek:** Seoul Weather & Heatwave Prediction Dashboard (UAS Praktikum Penambangan Data, D4 RPL SV UGM)  
**Stack Frontend:** React + Vite + Tailwind CSS + TypeScript  
**Referensi Model Aktual:** `rf_model.joblib` (`RandomForestRegressor`, `scikit-learn 1.9.1`)

Dokumen ini menjadi kontrak antarmuka antara tim Frontend (FE) dan tim Backend (BE), sekaligus acuan langsung bagi definisi tipe (`src/types/prediction.ts`) dan service layer (`src/services/predictionService.ts`). Selama server BE belum tersedia, FE menggunakan implementasi mock yang mematuhi skema request dan response yang sama persis.

---

## 1. Ringkasan dan Sinkronisasi Model Aktual (`rf_model.joblib`)

Berdasarkan inspeksi langsung terhadap berkas `rf_model.joblib`, terdapat **4 penyesuaian wajib** antara dokumen `PRD.md` dan model yang benar-benar akan dijalankan oleh backend:

1. **Nama dan Format Berkas Model**  
   Model aktual di repository adalah `rf_model.joblib` (`RandomForestRegressor`, 100 trees, `random_state=42`, tanpa scaler/pipeline tambahan), bukan `rf_seoul_model.model`.
2. **Penghapusan Fitur `station` dan Kewajiban Fitur `Slope`**  
   Model tetap menerima **21 fitur**, tetapi **tidak memakai kolom `station`**. Sebagai gantinya, model mewajibkan fitur **`Slope`** (kemiringan lereng, rentang split `0.116 - 4.954`). Pada UI (`F-UI-01`), dropdown 25 stasiun berfungsi mengisi otomatis 4 kolom geografis: `lat`, `lon`, `DEM`, dan `Slope`.
3. **Nama Kolom dan Skala `Solar radiation`**  
   Nama kolom eksak di model adalah **`Solar radiation`** (menggunakan spasi, bukan `Solar_radiation`). Skala split pohon keputusan model adalah **`4389.010 - 5990.307` Wh/m2** (median `5422.794`), bukan `4.3 - 38.6` MJ/m2.
4. **Urutan Eksak 21 `feature_names_in_`**  
   Backend wajib menyusun DataFrame/matriks input sesuai urutan dan ejaan persis berikut saat memanggil `model.predict()`:

| Urutan | Nama Fitur Eksak | Kelompok UI (`F-UI-03`) | Satuan | Rentang Split Model (`rf_model.joblib`) |
|:---:|:---|:---|:---:|:---:|
| 1 | `Present_Tmax` | Observasi Hari Ini | °C | `20.050 - 37.550` |
| 2 | `Present_Tmin` | Observasi Hari Ini | °C | `14.450 - 29.750` |
| 3 | `LDAPS_RHmin` | Prakiraan LDAPS | % | `21.567 - 95.816` |
| 4 | `LDAPS_RHmax` | Prakiraan LDAPS | % | `59.832 - 99.983` |
| 5 | `LDAPS_Tmax_lapse` | Prakiraan LDAPS | °C | `17.730 - 38.085` |
| 6 | `LDAPS_Tmin_lapse` | Prakiraan LDAPS | °C | `14.372 - 29.524` |
| 7 | `LDAPS_WS` | Prakiraan LDAPS | m/s | `3.197 - 19.885` |
| 8 | `LDAPS_LH` | Prakiraan LDAPS | W/m2 | `4.555 - 188.139` |
| 9 | `LDAPS_CC1` | Prakiraan LDAPS | Rasio (0-1) | `0.000 - 0.965` |
| 10 | `LDAPS_CC2` | Prakiraan LDAPS | Rasio (0-1) | `0.000 - 0.955` |
| 11 | `LDAPS_CC3` | Prakiraan LDAPS | Rasio (0-1) | `0.000 - 0.977` |
| 12 | `LDAPS_CC4` | Prakiraan LDAPS | Rasio (0-1) | `0.000 - 0.971` |
| 13 | `LDAPS_PPT1` | Prakiraan LDAPS | mm | `0.000 - 21.651` |
| 14 | `LDAPS_PPT2` | Prakiraan LDAPS | mm | `0.000 - 21.449` |
| 15 | `LDAPS_PPT3` | Prakiraan LDAPS | mm | `0.000 - 13.865` |
| 16 | `LDAPS_PPT4` | Prakiraan LDAPS | mm | `0.000 - 15.719` |
| 17 | `lat` | Lokasi & Topografi | °N | `37.463 - 37.632` |
| 18 | `lon` | Lokasi & Topografi | °E | `126.832 - 127.117` |
| 19 | `DEM` | Lokasi & Topografi | meter | `13.979 - 210.421` |
| 20 | `Slope` | Lokasi & Topografi | derajat/rasio | `0.116 - 4.954` |
| 21 | `Solar radiation` | Observasi Hari Ini | Wh/m2 | `4389.010 - 5990.307` |

Catatan: Istilah "Tekanan" yang sempat tertulis pada deskripsi `F-UI-03` di `PRD.md` tidak ada pada 21 fitur model dan digantikan oleh `LDAPS_LH` (fluks panas laten) serta `LDAPS_Tmax_lapse`/`LDAPS_Tmin_lapse`.

---

## 2. Konfigurasi Koneksi Frontend

### Environment Variables (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=true
VITE_API_TIMEOUT_MS=10000
```

- `VITE_API_BASE_URL`: URL dasar server backend tanpa trailing slash.
- `VITE_USE_MOCK`: Jika `true`, seluruh pemanggilan di `predictionService` memakai mock lokal; jika `false`, memanggil endpoint HTTP sungguhan.
- `VITE_API_TIMEOUT_MS`: Batas waktu tunggu request (default `10000` ms; untuk upload batch CSV besar, timeout dinaikkan ke `30000` ms).

### Kebutuhan CORS Backend

Jika FE berjalan pada dev server Vite (`http://localhost:5173`) atau origin terpisah di produksi, BE wajib mengizinkan:
- **Allowed Origins:** `http://localhost:5173`, `http://127.0.0.1:5173`, dan domain deploy produksi.
- **Allowed Methods:** `GET`, `POST`, `OPTIONS`.
- **Allowed Headers:** `Content-Type`, `Accept`.
- **Content Types yang Dipakai:** `application/json` dan `multipart/form-data`.

---

## 3. Spesifikasi Endpoint Kontrak

### 3.1 `GET /api/health`

Digunakan FE saat halaman pertama kali dimuat untuk memverifikasi kesiapan server dan status pemuatan model.

**Response `200 OK`:**

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_file": "rf_model.joblib",
  "n_features": 21,
  "sklearn_version": "1.9.1"
}
```

### 3.2 `GET /api/model-info`

Mengambil metadata evaluasi model dan daftar *global feature importance* aktual dari `rf_model.joblib` untuk komponen `F-UI-11` dan informasi model.

**Response `200 OK`:**

```json
{
  "algorithm": "RandomForestRegressor",
  "n_estimators": 100,
  "target": "Next_Tmax",
  "unit": "C",
  "metrics": {
    "r2": 0.8933,
    "mae": 0.743,
    "rmse": 1.0023
  },
  "feature_names": [
    "Present_Tmax",
    "Present_Tmin",
    "LDAPS_RHmin",
    "LDAPS_RHmax",
    "LDAPS_Tmax_lapse",
    "LDAPS_Tmin_lapse",
    "LDAPS_WS",
    "LDAPS_LH",
    "LDAPS_CC1",
    "LDAPS_CC2",
    "LDAPS_CC3",
    "LDAPS_CC4",
    "LDAPS_PPT1",
    "LDAPS_PPT2",
    "LDAPS_PPT3",
    "LDAPS_PPT4",
    "lat",
    "lon",
    "DEM",
    "Slope",
    "Solar radiation"
  ],
  "feature_importances": [
    { "feature": "LDAPS_Tmax_lapse", "importance": 0.6952 },
    { "feature": "Present_Tmax", "importance": 0.0537 },
    { "feature": "LDAPS_CC1", "importance": 0.0306 },
    { "feature": "LDAPS_CC3", "importance": 0.0242 },
    { "feature": "LDAPS_CC4", "importance": 0.0229 },
    { "feature": "LDAPS_WS", "importance": 0.0214 },
    { "feature": "Solar radiation", "importance": 0.018 },
    { "feature": "LDAPS_Tmin_lapse", "importance": 0.017 },
    { "feature": "Present_Tmin", "importance": 0.0149 },
    { "feature": "LDAPS_CC2", "importance": 0.0144 },
    { "feature": "LDAPS_LH", "importance": 0.0137 },
    { "feature": "LDAPS_RHmin", "importance": 0.0136 },
    { "feature": "LDAPS_RHmax", "importance": 0.0117 },
    { "feature": "LDAPS_PPT2", "importance": 0.0088 },
    { "feature": "LDAPS_PPT1", "importance": 0.0083 },
    { "feature": "DEM", "importance": 0.0081 },
    { "feature": "LDAPS_PPT3", "importance": 0.0062 },
    { "feature": "lon", "importance": 0.0056 },
    { "feature": "LDAPS_PPT4", "importance": 0.0047 },
    { "feature": "lat", "importance": 0.0037 },
    { "feature": "Slope", "importance": 0.0034 }
  ]
}
```

### 3.3 `GET /api/stations`

Mengembalikan daftar 25 stasiun pengamatan cuaca resmi Seoul hasil ekstraksi dataset UTS (`backend/data/stations.json`) untuk mengisi otomatis 4 parameter geografis dropdown `F-UI-01` (`lat`, `lon`, `DEM`, `Slope`). Data ini juga dapat disalin ke `src/data/stations.ts` sebagai fallback lokal FE.

**Response `200 OK`:**

```json
{
  "stations": [
    {
      "station_id": 1,
      "district_name": "Stasiun 1",
      "lat": 37.6046,
      "lon": 126.991,
      "DEM": 212.335,
      "Slope": 2.785
    }
  ]
}
```

### 3.4 `GET /api/presets`

Mengembalikan 3 skenario cepat nyata dari dataset UTS (`backend/data/presets.json`) yang telah diuji terhadap `rf_model.joblib` untuk tombol preset `F-UI-02`:
- `normal` (*Normal Musim Panas*, Stasiun 8, `2015-07-16`): prediksi `28.95 °C` (`normal`)
- `heatwave` (*Gelombang Panas*, Stasiun 25, `2017-08-04`): prediksi `36.54 °C` (`warning`)
- `rain` (*Hujan dan Berawan*, Stasiun 17, `2016-08-30`): prediksi `20.05 °C` (`cool`)

**Response `200 OK`:**

```json
{
  "presets": [
    {
      "id": "normal",
      "name": "Normal Musim Panas",
      "description": "Hari musim panas standar di Seoul tanpa curah hujan dan tutupan awan ringan.",
      "station_id": 8,
      "source_date": "2015-07-16",
      "expected_predicted_tmax": 28.95,
      "expected_status": "normal",
      "features": { "...": "21 fitur model" }
    }
  ]
}
```

### 3.5 `POST /api/predict`

Menghitung prediksi tunggal `Next_Tmax` berdasarkan 21 input fitur cuaca.

**Request Headers:** `Content-Type: application/json`

**Request Body:**

```json
{
  "station_id": 1,
  "features": {
    "Present_Tmax": 31.2,
    "Present_Tmin": 23.4,
    "LDAPS_RHmin": 48.5,
    "LDAPS_RHmax": 86.2,
    "LDAPS_Tmax_lapse": 33.4,
    "LDAPS_Tmin_lapse": 24.1,
    "LDAPS_WS": 5.8,
    "LDAPS_LH": 64.2,
    "LDAPS_CC1": 0.21,
    "LDAPS_CC2": 0.18,
    "LDAPS_CC3": 0.15,
    "LDAPS_CC4": 0.12,
    "LDAPS_PPT1": 0.0,
    "LDAPS_PPT2": 0.0,
    "LDAPS_PPT3": 0.0,
    "LDAPS_PPT4": 0.0,
    "lat": 37.537,
    "lon": 126.996,
    "DEM": 46.57,
    "Slope": 0.685,
    "Solar radiation": 5480.5
  }
}
```

- `station_id` bersifat **opsional** dan hanya dipakai untuk konteks pencatatan riwayat/logging, **tidak** dimasukkan sebagai input ke `rf_model.joblib`.
- Semua 21 key di dalam `features` wajib bertipe `number` (finite, bukan `NaN` atau `null`).

**Response `200 OK`:**

```json
{
  "predicted_tmax": 33.42,
  "present_tmax": 31.2,
  "delta_t": 2.22,
  "heatwave_status": "advisory",
  "inference_ms": 4.8,
  "top_factors": [
    { "feature": "LDAPS_Tmax_lapse", "importance": 0.6952, "value": 33.4 },
    { "feature": "Present_Tmax", "importance": 0.0537, "value": 31.2 },
    { "feature": "LDAPS_CC1", "importance": 0.0306, "value": 0.21 },
    { "feature": "LDAPS_CC3", "importance": 0.0242, "value": 0.15 },
    { "feature": "LDAPS_CC4", "importance": 0.0229, "value": 0.12 }
  ]
}
```

**Aturan Sinkronisasi Status Termal (`heatwave_status`):**

| `heatwave_status` | Rentang Suhu `predicted_tmax` | Label UI |
|:---|:---|:---|
| `cool` | `< 25.0 °C` | Sejuk |
| `normal` | `25.0 - 29.9 °C` | Nyaman |
| `warm` | `30.0 - 32.9 °C` | Hangat (Waspada) |
| `advisory` | `33.0 - 34.9 °C` | Siaga Gelombang Panas |
| `warning` | `>= 35.0 °C` | Bahaya Gelombang Panas Ekstrem |

Catatan kompatibilitas: Apabila BE hanya mengembalikan `predicted_tmax` dan `inference_ms`, FE tetap menghitung `delta_t`, `heatwave_status`, dan memakai fallback *global feature importances* secara otomatis sehingga UI tetap konsisten.

### 3.6 `POST /api/predict/batch`

Menjalankan prediksi untuk banyak baris sekaligus dari berkas CSV unggahan pengguna (`F-UI-05`).

**Request Headers:** `Content-Type: multipart/form-data`

**Form Field:**
- `file`: Berkas `.csv` (UTF-8, ukuran maksimal yang disarankan `5 MB` atau `5000` baris).
- Kolom CSV wajib mencakup 21 nama fitur eksak (`feature_names_in_`). Kolom tambahan seperti `Date` atau `station` diperbolehkan; BE mengabaikannya saat inferensi atau mengembalikannya sebagai `row_label`/`station_id` pada hasil.

**Response `200 OK`:**

```json
{
  "total_rows": 3,
  "processed_rows": 2,
  "failed_rows": 1,
  "inference_ms": 18.4,
  "summary": {
    "min_tmax": 27.85,
    "max_tmax": 35.12,
    "avg_tmax": 31.49,
    "advisory_count": 0,
    "warning_count": 1
  },
  "rows": [
    {
      "row_index": 1,
      "row_label": "2017-07-15 | Station 1",
      "present_tmax": 28.4,
      "predicted_tmax": 27.85,
      "delta_t": -0.55,
      "heatwave_status": "normal",
      "error": null
    },
    {
      "row_index": 2,
      "row_label": "2017-07-16 | Station 1",
      "present_tmax": 33.9,
      "predicted_tmax": 35.12,
      "delta_t": 1.22,
      "heatwave_status": "warning",
      "error": null
    },
    {
      "row_index": 3,
      "row_label": "2017-07-17 | Station 2",
      "present_tmax": null,
      "predicted_tmax": null,
      "delta_t": null,
      "heatwave_status": null,
      "error": "Nilai Solar radiation kosong atau bukan angka."
    }
  ]
}
```

Unduh CSV hasil (`Download CSV`) diolah langsung di sisi FE dari array `rows` agar tidak membutuhkan endpoint download terpisah di BE.

---

## 4. Standar Error Response dan HTTP Status Code

Seluruh error dari endpoint BE diharapkan memakai struktur JSON seragam berikut agar FE dapat menampilkan pesan error yang informatif pada input maupun banner:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input cuaca tidak valid atau belum lengkap.",
    "details": {
      "field_errors": {
        "Solar radiation": "Nilai harus berupa angka dalam satuan Wh/m2 (kisaran 4389 - 5990)."
      },
      "missing_columns": []
    }
  }
}
```

| HTTP Status | Kode Error | Kapan Terjadi | Respons FE |
|:---:|:---|:---|:---|
| `400` | `BAD_REQUEST` / `INVALID_CSV` | Format JSON rusak, bukan file `.csv`, atau header CSV tidak valid | Tampilkan error state pada panel upload/form dengan alasan jelas |
| `413` | `PAYLOAD_TOO_LARGE` | File CSV melebihi batas ukuran/baris server | Tampilkan info batas file yang diizinkan |
| `422` | `VALIDATION_ERROR` | Kolom fitur kurang, tipe bukan angka, atau di luar domain wajar | Sorot field terkait (`field_errors`) dan fokuskan input pertama yang bermasalah |
| `500` | `PREDICTION_FAILED` | Kegagalan internal saat inferensi model | Tampilkan error state dengan tombol "Coba Lagi" |
| `503` | `MODEL_NOT_READY` | `rf_model.joblib` gagal dimuat di server | Tampilkan banner status koneksi server dan tawarkan Mode Simulasi FE |

---

## 5. Definisi Tipe TypeScript Sisi Frontend (`src/types/prediction.ts`)

```ts
export type ThermalLevel = 'cool' | 'normal' | 'warm' | 'advisory' | 'warning';

export const MODEL_FEATURE_ORDER = [
  'Present_Tmax',
  'Present_Tmin',
  'LDAPS_RHmin',
  'LDAPS_RHmax',
  'LDAPS_Tmax_lapse',
  'LDAPS_Tmin_lapse',
  'LDAPS_WS',
  'LDAPS_LH',
  'LDAPS_CC1',
  'LDAPS_CC2',
  'LDAPS_CC3',
  'LDAPS_CC4',
  'LDAPS_PPT1',
  'LDAPS_PPT2',
  'LDAPS_PPT3',
  'LDAPS_PPT4',
  'lat',
  'lon',
  'DEM',
  'Slope',
  'Solar radiation',
] as const;

export type FeatureKey = (typeof MODEL_FEATURE_ORDER)[number];

export type WeatherFeatures = Record<FeatureKey, number>;

export interface StationPreset {
  station_id: number;
  district_name: string;
  lat: number;
  lon: number;
  DEM: number;
  Slope: number;
}

export interface ScenarioPreset {
  id: 'normal' | 'heatwave' | 'rain';
  name: string;
  description: string;
  station_id: number;
  source_date: string;
  expected_predicted_tmax: number;
  expected_status: ThermalLevel;
  features: WeatherFeatures;
}

export interface FeatureImportanceItem {
  feature: FeatureKey;
  importance: number;
  value?: number;
}

export interface SinglePredictRequest {
  station_id?: number;
  features: WeatherFeatures;
}

export interface SinglePredictResponse {
  predicted_tmax: number;
  present_tmax: number;
  delta_t: number;
  heatwave_status: ThermalLevel;
  inference_ms: number;
  top_factors?: FeatureImportanceItem[];
  is_mock?: boolean;
}

export interface BatchRowResult {
  row_index: number;
  row_label?: string;
  present_tmax: number | null;
  predicted_tmax: number | null;
  delta_t: number | null;
  heatwave_status: ThermalLevel | null;
  error: string | null;
}

export interface BatchPredictResponse {
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  inference_ms: number;
  summary: {
    min_tmax: number | null;
    max_tmax: number | null;
    avg_tmax: number | null;
    advisory_count: number;
    warning_count: number;
  };
  rows: BatchRowResult[];
  is_mock?: boolean;
}

export interface ModelInfoResponse {
  algorithm: string;
  n_estimators: number;
  target: string;
  unit: 'C';
  metrics: {
    r2: number;
    mae: number;
    rmse: number;
  };
  feature_names: FeatureKey[];
  feature_importances: FeatureImportanceItem[];
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  model_loaded: boolean;
  model_file: string;
  n_features: number;
  sklearn_version: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: {
      field_errors?: Partial<Record<FeatureKey, string>>;
      missing_columns?: string[];
    };
  };
}
```

---

## 6. Strategi Mock vs Live Service di Frontend

Agar pengembangan UI tidak terhambat sebelum backend siap, seluruh komponen UI hanya berinteraksi melalui satu interface service:

```ts
export interface PredictionService {
  getMode(): 'mock' | 'live';
  checkHealth(): Promise<HealthResponse>;
  getModelInfo(): Promise<ModelInfoResponse>;
  getStations(): Promise<StationPreset[]>;
  getPresets(): Promise<ScenarioPreset[]>;
  predictSingle(payload: SinglePredictRequest): Promise<SinglePredictResponse>;
  predictBatch(file: File): Promise<BatchPredictResponse>;
}
```

- **Saat `VITE_USE_MOCK=true`:** `predictionService` memakai `mockPredictor` (menghitung perkiraan suhu berbasis bobot aktual model seperti `LDAPS_Tmax_lapse`, `Present_Tmax`, `LDAPS_CC1..4`, `Solar radiation`, dan `LDAPS_PPT1..4` dengan hasil dalam rentang `17.4 - 37.8 °C`, serta mem-parse CSV langsung di browser). UI menampilkan penanda transparan **"Mode Simulasi FE"** agar tidak disalahartikan sebagai inferensi live `rf_model.joblib`.
- **Saat integrasi dengan BE (`VITE_USE_MOCK=false`):** Komponen UI tidak perlu diubah sama sekali. `httpPredictionService` mengirim request ke `VITE_API_BASE_URL` (default `backend/app.py` di port `8000`) dan memetakan response sesuai kontrak di atas.

---

## 7. Checklist Sinkronisasi dan Diskusi Tim Backend

Berikut status kesepakatan kontrak dan poin lanjutan jika tim BE mengembangkan ulang atau men-deploy server:

1. **Framework & Port BE:** Prototipe aktif di `backend/app.py` memakai Flask di port `8000` (`http://localhost:8000`). Konfirmasi port/domain produksi yang akan dipakai saat demo.
2. **Konvensi Key `Solar radiation`:** Standar JSON request `POST /api/predict` memakai key `"Solar radiation"` (dengan spasi sesuai `feature_names_in_`), dan `backend/app.py` juga menerima alias `"Solar_radiation"`.
3. **Sumber Data 25 Stasiun (`GET /api/stations`):** Data 25 stasiun asli (`lat`, `lon`, `DEM`, `Slope`) sudah terekstrak dari dataset UTS ke `backend/data/stations.json` dan dilayani di `GET /api/stations`.
4. **Skenario Preset Resmi (`GET /api/presets`):** Tiga skenario nyata dari dataset UTS sudah terekstrak ke `backend/data/presets.json` (`normal`: `28.95 °C`, `heatwave`: `36.54 °C`, `rain`: `20.05 °C`) dan dilayani di `GET /api/presets`.
5. **Batas Upload Batch CSV (`F-UI-05`):** Batas saat ini di `backend/app.py` adalah `5 MB` / `5000` baris, dengan penanganan error per baris (`failed_rows`) sehingga baris valid tetap diprediksi.
6. **Penjelasan Faktor Penentu (`F-UI-11`):** Saat ini `POST /api/predict` mengembalikan 7 faktor teratas dari *global feature importance* `rf_model.joblib` beserta nilai input pengguna; diskusikan dengan tim jika ingin menambah kontribusi lokal per baris (misal SHAP).
