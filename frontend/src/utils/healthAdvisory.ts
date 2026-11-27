import type { ThermalLevel } from '../types/prediction';

export const HEALTH_ADVISORY_MAP: Record<ThermalLevel, string[]> = {
  cool: [
    'Aktivitas luar ruang dapat berlangsung normal sepanjang hari.',
    'Siapkan lapisan pakaian tipis tambahan atau payung jika tutupan awan dan curah hujan aktif.',
    'Tetap jaga kecukupan minum meskipun udara terasa sejuk.',
  ],
  normal: [
    'Kondisi suhu ideal untuk mobilitas dan kegiatan luar ruang rutin.',
    'Konsumsi air putih minimal 2 liter per hari untuk menjaga hidrasi.',
    'Gunakan pelindung matahari ringan bila beraktivitas di area terbuka saat siang.',
  ],
  warm: [
    'Pilih pakaian longgar, ringan, dan berwarna terang saat keluar rumah.',
    'Minum air putih secara berkala sebelum merasa haus, minimal 2 - 2.5 liter per hari.',
    'Gunakan tabir surya, topi, atau kacamata pelindung saat berada di luar ruangan pukul 11.00 - 15.00.',
  ],
  advisory: [
    'Batasi aktivitas fisik berat di luar ruangan terutama pada pukul 12.00 - 15.00.',
    'Tingkatkan asupan cairan dan elektrolit secara rutin setiap 30 - 45 menit saat berada di luar.',
    'Pantau kondisi kelompok rentan (lansia, anak kecil, dan pekerja lapangan) dari gejala kelelahan panas.',
    'Manfaatkan ruang berpendingin atau tempat teduh untuk istirahat berkala.',
  ],
  warning: [
    'Hindari aktivitas luar ruang yang tidak mendesak antara pukul 11.00 - 16.00.',
    'Pastikan akses ke ruang berpendingin atau kipas dengan ventilasi baik dan hidrasi minimal 3 liter per hari.',
    'Waspadai tanda heatstroke (pusing hebat, kulit panas kering, mual) dan segera hubungi layanan darurat 119 bila muncul.',
    'Periksa kondisi warga lanjut usia yang tinggal sendiri dan jangan tinggalkan anak atau hewan di dalam kendaraan tertutup.',
  ],
};

/** Mengembalikan daftar langkah mitigasi kesehatan sesuai level termal. */
export function getHealthAdvisories(level: ThermalLevel): string[] {
  return HEALTH_ADVISORY_MAP[level];
}
