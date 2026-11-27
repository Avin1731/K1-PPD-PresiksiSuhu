import type { Locale } from '../hooks/useLanguage';
import type { ThermalLevel } from '../types/prediction';

export const HEALTH_ADVISORY_MAP: Record<ThermalLevel, Record<Locale, string[]>> = {
  cool: {
    id: [
      'Aktivitas luar ruang dapat berlangsung normal sepanjang hari.',
      'Siapkan lapisan pakaian tipis tambahan atau payung jika tutupan awan dan curah hujan aktif.',
      'Tetap jaga kecukupan minum meskipun udara terasa sejuk.',
    ],
    en: [
      'Normal outdoor activities can proceed comfortably throughout the day.',
      'Bring a light layer or umbrella if cloud cover and rainfall are active.',
      'Maintain steady water intake even in cooler weather.',
    ],
  },
  normal: {
    id: [
      'Kondisi suhu ideal untuk mobilitas dan kegiatan luar ruang rutin.',
      'Konsumsi air putih minimal 2 liter per hari untuk menjaga hidrasi.',
      'Gunakan pelindung matahari ringan bila beraktivitas di area terbuka saat siang.',
    ],
    en: [
      'Ideal temperature conditions for daily commuting and routine outdoor activities.',
      'Drink at least 2 liters of water daily to stay adequately hydrated.',
      'Wear light sun protection during midday outdoor exposure.',
    ],
  },
  warm: {
    id: [
      'Pilih pakaian longgar, ringan, dan berwarna terang saat keluar rumah.',
      'Minum air putih secara berkala sebelum merasa haus, minimal 2 - 2.5 liter per hari.',
      'Gunakan tabir surya, topi, atau kacamata pelindung saat berada di luar ruangan pukul 11.00 - 15.00.',
    ],
    en: [
      'Wear loose, breathable, light-colored clothing when going outdoors.',
      'Drink water regularly before feeling thirsty, targeting 2 - 2.5 liters per day.',
      'Apply sunscreen and wear a hat or sunglasses outdoors between 11:00 and 15:00.',
    ],
  },
  advisory: {
    id: [
      'Batasi aktivitas fisik berat di luar ruangan terutama pada pukul 12.00 - 15.00.',
      'Tingkatkan asupan cairan dan elektrolit secara rutin setiap 30 - 45 menit saat berada di luar.',
      'Pantau kondisi kelompok rentan (lansia, anak kecil, dan pekerja lapangan) dari gejala kelelahan panas.',
      'Manfaatkan ruang berpendingin atau tempat teduh untuk istirahat berkala.',
    ],
    en: [
      'Limit strenuous outdoor physical activity especially between 12:00 and 15:00.',
      'Replenish water and electrolytes every 30 - 45 minutes when working outside.',
      'Check on vulnerable groups (older adults, children, outdoor workers) for heat exhaustion.',
      'Take regular breaks in shaded or air-conditioned spaces.',
    ],
  },
  warning: {
    id: [
      'Hindari aktivitas luar ruang yang tidak mendesak antara pukul 11.00 - 16.00.',
      'Pastikan akses ke ruang berpendingin atau kipas dengan ventilasi baik dan hidrasi minimal 3 liter per hari.',
      'Waspadai tanda heatstroke (pusing hebat, kulit panas kering, mual) dan segera hubungi layanan darurat 119 bila muncul.',
      'Periksa kondisi warga lanjut usia yang tinggal sendiri dan jangan tinggalkan anak atau hewan di dalam kendaraan tertutup.',
    ],
    en: [
      'Avoid non-essential outdoor activity between 11:00 and 16:00.',
      'Stay in air-conditioned or well-ventilated spaces and drink at least 3 liters of water daily.',
      'Watch for heatstroke symptoms (dizziness, hot dry skin, nausea) and call emergency 119 immediately.',
      'Check on elderly neighbors living alone and never leave children or pets inside parked vehicles.',
    ],
  },
};

/** Mengembalikan daftar langkah mitigasi kesehatan sesuai level termal dan bahasa aktif. */
export function getHealthAdvisories(level: ThermalLevel, locale: Locale = 'id'): string[] {
  return HEALTH_ADVISORY_MAP[level][locale];
}
