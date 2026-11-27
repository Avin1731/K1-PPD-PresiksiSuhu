import type { Locale } from '../hooks/useLanguage';
import type { FeatureKey, InputTabId, ScenarioPreset, ThermalLevel } from '../types/prediction';

export const UI_STRINGS = {
  id: {
    pageTitle: 'Prediksi Suhu & Gelombang Panas Seoul',
    headerTitle: 'Prediksi Suhu & Gelombang Panas Seoul',
    serviceGroupLabel: 'Sumber layanan prediksi',
    serviceLive: 'API Flask',
    serviceMock: 'Simulasi FE',
    statusChecking: 'Memeriksa koneksi...',
    statusDisconnected: 'API Tidak Terhubung',
    statusConnected: 'API Terhubung',
    statusMock: 'Mode Simulasi FE',
    retryHealthTitle: 'Klik untuk memeriksa ulang koneksi server backend',
    themeToDark: 'Aktifkan mode gelap',
    themeToLight: 'Aktifkan mode terang',
    languageGroupLabel: 'Pilih bahasa antarmuka',

    introTitle: 'Prakiraan Suhu Maksimum & Peringatan Dini Gelombang Panas Seoul',
    introDesc: (count: number) =>
      `Memprediksi suhu maksimum esok hari (Next_Tmax) dan status peringatan KMA dari 21 parameter atmosfer LDAPS serta observasi di ${count} stasiun pengamatan cuaca Seoul.`,
    statStations: 'Stasiun AWS',
    statR2: 'Akurasi R2',
    statMae: 'Galat MAE',

    modeGroupLabel: 'Mode prediksi',
    modeSingle: 'Prediksi Tunggal',
    modeBatch: 'Batch CSV',

    inputPanelTitle: 'Parameter Cuaca & Stasiun (21 Fitur Model)',
    inputPanelSubtitle: 'Pilih stasiun dan skenario cepat, atau ubah parameter per kategori tab.',
    stationLabel: 'Stasiun Pengamatan Cuaca Seoul (1 - 25)',
    stationPrefix: 'Stasiun',
    stationManualTag: 'Koordinat disesuaikan manual',
    stationManualSuffix: '(Koordinat disesuaikan)',
    stationAutoFillPrefix: 'Auto-fill aktif',

    presetsTitle: 'Skenario Cepat (Data Asli Dataset UTS)',
    presetsHint: 'Isi 21 parameter dalam 1 klik',

    tabsGroupLabel: 'Kelompok 21 parameter input cuaca',
    tabErrorLabel: (count: number) => `${count} input bermasalah`,
    trainRangeLabel: 'Rentang latih',
    predictBtn: 'Prediksi Suhu Esok Hari',
    predictBtnLoading: 'Menghitung prediksi...',
    resetBtn: 'Reset',

    emptyTitle: 'Siap Menghitung Prediksi Suhu Esok Hari',
    emptyBodyPrefix:
      'Pilih stasiun cuaca dan skenario cepat atau sesuaikan 21 parameter di sebelah kiri, lalu klik',
    emptyScaleHeading: 'Acuan Skala Peringatan Dini 5-Level (Next_Tmax)',
    loadingLabel: 'Memproses 21 parameter cuaca...',
    errorTitle: 'Gagal Menghitung Prediksi',
    retryBtn: 'Coba Lagi',
    switchMockBtn: 'Gunakan Mode Simulasi FE',

    heroTitle: 'Prakiraan Suhu Maksimum Esok Hari (Next_Tmax)',
    heroDeltaVsToday: 'vs hari ini',
    heroDeltaPrefix: 'Selisih',
    heroTodayPresent: 'Present_Tmax hari ini',
    heroLocation: 'Lokasi',
    heroSource: 'Sumber',
    sourceMock: 'Estimasi Simulasi FE (menunggu API model)',
    sourceLive: 'API Live rf_model.joblib',

    gaugeTitle: 'Skala Termal Terkalibrasi',
    gaugeCurrentPos: 'Posisi saat ini',
    gaugeAriaLabel: (temp: string, label: string) =>
      `Skala termal menunjukkan ${temp} derajat Celsius, status ${label}`,

    deltaTitle: 'Selisih Suhu vs Hari Ini (Delta T)',
    deltaStable: 'Relatif stabil dibanding hari ini',
    deltaWarmer: 'Besok diprakirakan lebih terik',
    deltaCooler: 'Besok diprakirakan lebih sejuk',
    deltaToday: 'Hari Ini (Present_Tmax)',
    deltaTomorrow: 'Esok Hari (Next_Tmax)',

    advisoryTitle: 'Saran Mitigasi Kesehatan Warga',

    xaiTitle: 'Variabel apa yang paling memengaruhi prediksi model?',
    xaiSubtitle:
      'Bobot kontribusi global 7 fitur teratas pada Random Forest (rf_model.joblib) beserta nilai input yang Anda masukkan.',
    xaiInputLabel: 'Input',

    historyTitle: 'Riwayat Prediksi Sesi (5 Terakhir)',
    historySubtitle: 'Bandingkan beberapa skenario percobaan atau muat ulang parameternya ke formulir.',
    historyClear: 'Hapus Riwayat',
    historyEmptyTitle: 'Belum ada riwayat prediksi pada sesi ini',
    historyEmptyBody:
      'Jalankan prediksi pertama di formulir atas untuk mencatat dan membandingkan hasilnya di sini.',
    historyColStatus: 'Status',
    historyColStation: 'Stasiun',
    historyColTimeSource: 'Waktu & Sumber',
    historyColAction: 'Aksi',
    historyReload: 'Muat Ulang Input',
    historyTodayShort: 'Hari Ini',
    historySourceMock: 'Simulasi FE',
    historySourceLive: 'API Live',

    batchTitle: 'Prediksi Massal Multi-Hari (Batch CSV)',
    batchDesc:
      'Unggah berkas .csv (maksimal 5 MB atau 5.000 baris) yang memuat 21 kolom fitur model eksak termasuk Slope dan Solar radiation (Wh/m2).',
    batchDownloadTemplate: 'Unduh Template CSV',
    batchDropSelected: (name: string) => `Berkas dipilih: ${name}`,
    batchDropPrompt: 'Seret file .csv ke area ini atau klik untuk memilih',
    batchDropHint:
      'Format UTF-8 dengan 21 fitur model. Kolom opsional Date dan station akan dipakai sebagai label baris.',
    batchLoading: 'Memproses baris CSV...',
    batchErrorTitle: 'Gagal Memproses Berkas CSV',
    batchMissingCols: 'Kolom yang hilang:',
    batchClearError: 'Bersihkan Error',
    batchSummaryTitle: 'Ringkasan Hasil Batch',
    batchDownloadResult: 'Unduh Hasil CSV',
    batchClearResult: 'Bersihkan Hasil',
    batchStatProcessed: 'Diproses / Gagal',
    batchStatMin: 'Suhu Minimum',
    batchStatAvg: 'Rata-rata Suhu',
    batchStatMax: 'Suhu Maksimum',
    batchStatRisk: 'Siaga / Bahaya',
    batchColRow: 'Baris',
    batchColStatus: 'Status Termal',
    batchColNote: 'Keterangan',
    batchRowFailed: 'Baris Gagal',
    batchRowValid: 'Valid',

    footerProject:
      'Proyek UAS Praktikum Penambangan Data, D4 Rekayasa Perangkat Lunak SV UGM | Kelompok 1',
    footerTagline:
      'Sistem pendukung keputusan prakiraan suhu harian dan mitigasi gelombang panas Kota Seoul.',
    footerModel: 'RandomForestRegressor (rf_model.joblib) | Dataset UCI Seoul Temperature / LDAPS',
    footerRepo: 'Repositori GitHub',

    validationRequired: (label: string) => `${label} wajib diisi.`,
    validationInvalidNumber: (label: string) => `${label} harus berupa angka valid.`,
    validationOutOfRange: (min: number, max: number, unit: string) =>
      `Di luar kisaran latih model (${min} - ${max} ${unit}).`,
    validationTminGtTmax: 'Suhu minimum hari ini tidak boleh melebihi suhu maksimum.',
  },
  en: {
    pageTitle: 'Seoul Temperature & Heatwave Prediction',
    headerTitle: 'Seoul Temperature & Heatwave Prediction',
    serviceGroupLabel: 'Prediction service source',
    serviceLive: 'Flask API',
    serviceMock: 'FE Simulation',
    statusChecking: 'Checking connection...',
    statusDisconnected: 'API Disconnected',
    statusConnected: 'API Connected',
    statusMock: 'FE Simulation Mode',
    retryHealthTitle: 'Click to re-check backend server connection',
    themeToDark: 'Switch to dark mode',
    themeToLight: 'Switch to light mode',
    languageGroupLabel: 'Select interface language',

    introTitle: 'Seoul Daily Maximum Temperature & Heatwave Early Warning',
    introDesc: (count: number) =>
      `Predicts next-day maximum temperature (Next_Tmax) and KMA heatwave alert level from 21 LDAPS atmospheric and observed features across ${count} Seoul weather stations.`,
    statStations: 'AWS Stations',
    statR2: 'R2 Score',
    statMae: 'MAE Error',

    modeGroupLabel: 'Prediction mode',
    modeSingle: 'Single Prediction',
    modeBatch: 'Batch CSV',

    inputPanelTitle: 'Weather & Station Parameters (21 Model Features)',
    inputPanelSubtitle: 'Choose a station and quick scenario, or edit parameters by tab category.',
    stationLabel: 'Seoul Weather Observation Station (1 - 25)',
    stationPrefix: 'Station',
    stationManualTag: 'Coordinates adjusted manually',
    stationManualSuffix: '(Coordinates adjusted)',
    stationAutoFillPrefix: 'Auto-fill active',

    presetsTitle: 'Quick Scenarios (Real UTS Dataset Rows)',
    presetsHint: 'Populate 21 features in 1 click',

    tabsGroupLabel: '21 weather input parameter groups',
    tabErrorLabel: (count: number) => `${count} invalid fields`,
    trainRangeLabel: 'Train range',
    predictBtn: 'Predict Tomorrow Temperature',
    predictBtnLoading: 'Calculating prediction...',
    resetBtn: 'Reset',

    emptyTitle: 'Ready to Predict Next-Day Temperature',
    emptyBodyPrefix:
      'Select a station and quick scenario or adjust the 21 parameters on the left, then click',
    emptyScaleHeading: '5-Level Heatwave Early Warning Scale (Next_Tmax)',
    loadingLabel: 'Processing 21 weather parameters...',
    errorTitle: 'Prediction Failed',
    retryBtn: 'Try Again',
    switchMockBtn: 'Use FE Simulation Mode',

    heroTitle: 'Predicted Next-Day Maximum Temperature (Next_Tmax)',
    heroDeltaVsToday: 'vs today',
    heroDeltaPrefix: 'Delta',
    heroTodayPresent: 'Today Present_Tmax',
    heroLocation: 'Location',
    heroSource: 'Source',
    sourceMock: 'FE Simulation Estimate (awaiting model API)',
    sourceLive: 'Live API rf_model.joblib',

    gaugeTitle: 'Calibrated Thermal Scale',
    gaugeCurrentPos: 'Current reading',
    gaugeAriaLabel: (temp: string, label: string) =>
      `Thermal gauge showing ${temp} degrees Celsius, status ${label}`,

    deltaTitle: 'Temperature Delta vs Today (Delta T)',
    deltaStable: 'Relatively stable compared to today',
    deltaWarmer: 'Tomorrow is forecast to be hotter',
    deltaCooler: 'Tomorrow is forecast to be cooler',
    deltaToday: 'Today (Present_Tmax)',
    deltaTomorrow: 'Tomorrow (Next_Tmax)',

    advisoryTitle: 'Public Health Mitigation Advisory',

    xaiTitle: 'Which variables drive the model prediction most?',
    xaiSubtitle:
      'Global contribution weights of the top 7 features in Random Forest (rf_model.joblib) alongside your current input values.',
    xaiInputLabel: 'Input',

    historyTitle: 'Session Prediction History (Last 5)',
    historySubtitle: 'Compare tested weather scenarios or reload their parameters back into the form.',
    historyClear: 'Clear History',
    historyEmptyTitle: 'No prediction history in this session yet',
    historyEmptyBody:
      'Run your first prediction in the form above to record and compare results here.',
    historyColStatus: 'Status',
    historyColStation: 'Station',
    historyColTimeSource: 'Time & Source',
    historyColAction: 'Action',
    historyReload: 'Reload Inputs',
    historyTodayShort: 'Today',
    historySourceMock: 'FE Simulation',
    historySourceLive: 'Live API',

    batchTitle: 'Multi-Day Batch Prediction (CSV Upload)',
    batchDesc:
      'Upload a .csv file (max 5 MB or 5,000 rows) containing the exact 21 model columns including Slope and Solar radiation (Wh/m2).',
    batchDownloadTemplate: 'Download CSV Template',
    batchDropSelected: (name: string) => `Selected file: ${name}`,
    batchDropPrompt: 'Drag and drop a .csv file here or click to browse',
    batchDropHint:
      'UTF-8 format with 21 model features. Optional Date and station columns are used as row labels.',
    batchLoading: 'Processing CSV rows...',
    batchErrorTitle: 'Failed to Process CSV File',
    batchMissingCols: 'Missing columns:',
    batchClearError: 'Clear Error',
    batchSummaryTitle: 'Batch Result Summary',
    batchDownloadResult: 'Download Result CSV',
    batchClearResult: 'Clear Results',
    batchStatProcessed: 'Processed / Failed',
    batchStatMin: 'Minimum Temp',
    batchStatAvg: 'Average Temp',
    batchStatMax: 'Maximum Temp',
    batchStatRisk: 'Advisory / Warning',
    batchColRow: 'Row',
    batchColStatus: 'Thermal Status',
    batchColNote: 'Note',
    batchRowFailed: 'Failed Row',
    batchRowValid: 'Valid',

    footerProject:
      'Data Mining Practicum Final Project, Applied Bachelor of Software Engineering SV UGM | Group 1',
    footerTagline:
      'Decision support dashboard for daily temperature forecasting and Seoul heatwave mitigation.',
    footerModel: 'RandomForestRegressor (rf_model.joblib) | UCI Seoul Temperature / LDAPS Dataset',
    footerRepo: 'GitHub Repository',

    validationRequired: (label: string) => `${label} is required.`,
    validationInvalidNumber: (label: string) => `${label} must be a valid number.`,
    validationOutOfRange: (min: number, max: number, unit: string) =>
      `Outside model training range (${min} - ${max} ${unit}).`,
    validationTminGtTmax: 'Today minimum temperature cannot exceed maximum temperature.',
  },
} as const;

export const TAB_TEXT_MAP: Record<InputTabId, Record<Locale, { label: string; shortLabel: string }>> = {
  location: {
    id: { label: 'Lokasi & Topografi', shortLabel: 'Lokasi' },
    en: { label: 'Location & Topography', shortLabel: 'Location' },
  },
  observation: {
    id: { label: 'Observasi Hari Ini', shortLabel: 'Observasi' },
    en: { label: 'Today Observation', shortLabel: 'Observed' },
  },
  ldaps: {
    id: { label: 'Prakiraan LDAPS', shortLabel: 'LDAPS' },
    en: { label: 'LDAPS Forecast', shortLabel: 'LDAPS' },
  },
};

export const PRESET_TEXT_MAP: Record<
  ScenarioPreset['id'],
  Record<Locale, { name: string; description: string }>
> = {
  normal: {
    id: {
      name: 'Normal Musim Panas',
      description: 'Hari musim panas standar di Seoul tanpa curah hujan dan tutupan awan ringan.',
    },
    en: {
      name: 'Normal Summer',
      description: 'Standard Seoul summer day with no rainfall and light cloud cover.',
    },
  },
  heatwave: {
    id: {
      name: 'Gelombang Panas',
      description: 'Kondisi panas ekstrem dengan radiasi tinggi dan tutupan awan minim.',
    },
    en: {
      name: 'Heatwave',
      description: 'Extreme heat scenario with high solar radiation and minimal cloud cover.',
    },
  },
  rain: {
    id: {
      name: 'Hujan dan Berawan',
      description: 'Hari berawan tebal dengan curah hujan aktif dan suhu sejuk.',
    },
    en: {
      name: 'Rainy & Overcast',
      description: 'Heavy cloud cover with active rainfall and cooler temperature.',
    },
  },
};

export const SUBGROUP_EN_MAP: Record<string, string> = {
  'Koordinat Stasiun': 'Station Coordinates',
  Topografi: 'Topography',
  'Suhu Observasi': 'Observed Temperature',
  'Radiasi Harian': 'Daily Radiation',
  'Suhu & Kelembapan LDAPS': 'LDAPS Temperature & Humidity',
  'Angin & Fluks Panas': 'Wind & Latent Heat Flux',
  'Tutupan Awan 4 Kuadran': 'Cloud Cover (4 Windows)',
  'Curah Hujan 4 Kuadran': 'Precipitation (4 Windows)',
};

export const FEATURE_EN_MAP: Record<FeatureKey, { label: string; description: string }> = {
  lat: {
    label: 'Latitude (lat)',
    description: 'Station latitude coordinate in Seoul.',
  },
  lon: {
    label: 'Longitude (lon)',
    description: 'Station longitude coordinate in Seoul.',
  },
  DEM: {
    label: 'Elevation (DEM)',
    description: 'Digital elevation above sea level at the station.',
  },
  Slope: {
    label: 'Terrain Slope (Slope)',
    description: 'Local terrain slope angle around the weather station.',
  },
  Present_Tmax: {
    label: 'Today Max Temp',
    description: 'Observed maximum air temperature today.',
  },
  Present_Tmin: {
    label: 'Today Min Temp',
    description: 'Observed minimum air temperature today.',
  },
  'Solar radiation': {
    label: 'Solar Radiation',
    description: 'Daily accumulated incoming solar radiation at the surface.',
  },
  LDAPS_Tmax_lapse: {
    label: 'LDAPS Max Lapse Temp',
    description: 'LDAPS lapse-rate projected maximum temperature (top predictor).',
  },
  LDAPS_Tmin_lapse: {
    label: 'LDAPS Min Lapse Temp',
    description: 'LDAPS lapse-rate projected minimum temperature.',
  },
  LDAPS_RHmin: {
    label: 'LDAPS Min Humidity',
    description: 'LDAPS forecast minimum relative humidity.',
  },
  LDAPS_RHmax: {
    label: 'LDAPS Max Humidity',
    description: 'LDAPS forecast maximum relative humidity.',
  },
  LDAPS_WS: {
    label: 'Surface Wind Speed',
    description: 'LDAPS forecast average surface wind speed.',
  },
  LDAPS_LH: {
    label: 'Latent Heat Flux',
    description: 'LDAPS forecast surface latent heat flux.',
  },
  LDAPS_CC1: {
    label: 'Cloud Cover (00:00 - 06:00)',
    description: 'Cloud cover ratio during early morning window.',
  },
  LDAPS_CC2: {
    label: 'Cloud Cover (06:00 - 12:00)',
    description: 'Cloud cover ratio during morning to noon window.',
  },
  LDAPS_CC3: {
    label: 'Cloud Cover (12:00 - 18:00)',
    description: 'Cloud cover ratio during afternoon window.',
  },
  LDAPS_CC4: {
    label: 'Cloud Cover (18:00 - 24:00)',
    description: 'Cloud cover ratio during evening window.',
  },
  LDAPS_PPT1: {
    label: 'Rainfall (00:00 - 06:00)',
    description: 'Accumulated precipitation during early morning window.',
  },
  LDAPS_PPT2: {
    label: 'Rainfall (06:00 - 12:00)',
    description: 'Accumulated precipitation during morning to noon window.',
  },
  LDAPS_PPT3: {
    label: 'Rainfall (12:00 - 18:00)',
    description: 'Accumulated precipitation during afternoon window.',
  },
  LDAPS_PPT4: {
    label: 'Rainfall (18:00 - 24:00)',
    description: 'Accumulated precipitation during evening window.',
  },
};

export const THERMAL_TEXT_MAP: Record<
  ThermalLevel,
  Record<Locale, { label: string; bannerTitle: string; bannerDescription: string }>
> = {
  cool: {
    id: {
      label: 'Sejuk',
      bannerTitle: 'Kondisi Udara Sejuk',
      bannerDescription:
        'Suhu maksimum esok hari diprakirakan sejuk dan nyaman untuk aktivitas luar ruang.',
    },
    en: {
      label: 'Cool',
      bannerTitle: 'Cool Atmospheric Conditions',
      bannerDescription:
        'Tomorrow maximum temperature is forecast to remain cool and comfortable for outdoor activities.',
    },
  },
  normal: {
    id: {
      label: 'Nyaman',
      bannerTitle: 'Kondisi Normal & Nyaman',
      bannerDescription:
        'Suhu berada dalam kisaran musim panas normal Seoul tanpa risiko gelombang panas.',
    },
    en: {
      label: 'Comfortable',
      bannerTitle: 'Normal & Comfortable Conditions',
      bannerDescription:
        'Temperature stays within the typical Seoul summer range with no heatwave risk.',
    },
  },
  warm: {
    id: {
      label: 'Hangat (Waspada)',
      bannerTitle: 'Waspada Peningkatan Suhu',
      bannerDescription:
        'Suhu siang hari terasa terik; perhatikan asupan cairan saat beraktivitas di luar ruangan.',
    },
    en: {
      label: 'Warm (Caution)',
      bannerTitle: 'Elevated Daytime Temperature Caution',
      bannerDescription:
        'Afternoon conditions will feel hot; stay hydrated when working or walking outdoors.',
    },
  },
  advisory: {
    id: {
      label: 'Siaga Gelombang Panas',
      bannerTitle: 'Siaga Gelombang Panas (KMA Advisory)',
      bannerDescription:
        'Memasuki ambang siaga gelombang panas; kurangi paparan matahari langsung pada tengah hari.',
    },
    en: {
      label: 'Heatwave Advisory',
      bannerTitle: 'Heatwave Advisory (KMA Level 1)',
      bannerDescription:
        'Forecast crosses the heatwave advisory threshold; limit direct sun exposure around midday.',
    },
  },
  warning: {
    id: {
      label: 'Bahaya Gelombang Panas Ekstrem',
      bannerTitle: 'Bahaya Gelombang Panas Ekstrem (KMA Warning)',
      bannerDescription:
        'Suhu berpotensi berbahaya bagi kesehatan; prioritaskan pendinginan ruang dan hindari luar ruang siang hari.',
    },
    en: {
      label: 'Extreme Heatwave Warning',
      bannerTitle: 'Extreme Heatwave Warning (KMA Level 2)',
      bannerDescription:
        'Potentially hazardous heat levels; prioritize indoor cooling and avoid midday outdoor exertion.',
    },
  },
};
