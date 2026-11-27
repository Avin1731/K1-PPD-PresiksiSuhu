import type { ThermalLevel } from '../types/prediction';

export interface ThermalLevelMeta {
  level: ThermalLevel;
  label: string;
  rangeLabel: string;
  bannerTitle: string;
  bannerDescription: string;
  ink: string;
  bg: string;
  border: string;
  gaugeColor: string;
}

export const THERMAL_LEVEL_ORDER: ThermalLevel[] = [
  'cool',
  'normal',
  'warm',
  'advisory',
  'warning',
];

export const THERMAL_SCALE_MAP: Record<ThermalLevel, ThermalLevelMeta> = {
  cool: {
    level: 'cool',
    label: 'Sejuk',
    rangeLabel: '< 25.0 °C',
    bannerTitle: 'Kondisi Udara Sejuk',
    bannerDescription: 'Suhu maksimum esok hari diprakirakan sejuk dan nyaman untuk aktivitas luar ruang.',
    ink: 'var(--thermal-cool-ink)',
    bg: 'var(--thermal-cool-bg)',
    border: 'var(--thermal-cool-border)',
    gaugeColor: 'var(--thermal-cool-gauge)',
  },
  normal: {
    level: 'normal',
    label: 'Nyaman',
    rangeLabel: '25.0 - 29.9 °C',
    bannerTitle: 'Kondisi Normal & Nyaman',
    bannerDescription: 'Suhu berada dalam kisaran musim panas normal Seoul tanpa risiko gelombang panas.',
    ink: 'var(--thermal-normal-ink)',
    bg: 'var(--thermal-normal-bg)',
    border: 'var(--thermal-normal-border)',
    gaugeColor: 'var(--thermal-normal-gauge)',
  },
  warm: {
    level: 'warm',
    label: 'Hangat (Waspada)',
    rangeLabel: '30.0 - 32.9 °C',
    bannerTitle: 'Waspada Peningkatan Suhu',
    bannerDescription: 'Suhu siang hari terasa terik; perhatikan asupan cairan saat beraktivitas di luar ruangan.',
    ink: 'var(--thermal-warm-ink)',
    bg: 'var(--thermal-warm-bg)',
    border: 'var(--thermal-warm-border)',
    gaugeColor: 'var(--thermal-warm-gauge)',
  },
  advisory: {
    level: 'advisory',
    label: 'Siaga Gelombang Panas',
    rangeLabel: '33.0 - 34.9 °C',
    bannerTitle: 'Siaga Gelombang Panas (KMA Advisory)',
    bannerDescription: 'Memasuki ambang siaga gelombang panas; kurangi paparan matahari langsung pada tengah hari.',
    ink: 'var(--thermal-advisory-ink)',
    bg: 'var(--thermal-advisory-bg)',
    border: 'var(--thermal-advisory-border)',
    gaugeColor: 'var(--thermal-advisory-gauge)',
  },
  warning: {
    level: 'warning',
    label: 'Bahaya Gelombang Panas Ekstrem',
    rangeLabel: '>= 35.0 °C',
    bannerTitle: 'Bahaya Gelombang Panas Ekstrem (KMA Warning)',
    bannerDescription: 'Suhu berpotensi berbahaya bagi kesehatan; prioritaskan pendinginan ruang dan hindari luar ruang siang hari.',
    ink: 'var(--thermal-warning-ink)',
    bg: 'var(--thermal-warning-bg)',
    border: 'var(--thermal-warning-border)',
    gaugeColor: 'var(--thermal-warning-gauge)',
  },
};

/** Klasifikasikan suhu prediksi Next_Tmax ke dalam 5 level termal terkalibrasi. */
export function classifyThermalLevel(tempCelsius: number): ThermalLevel {
  if (tempCelsius < 25.0) return 'cool';
  if (tempCelsius < 30.0) return 'normal';
  if (tempCelsius < 33.0) return 'warm';
  if (tempCelsius < 35.0) return 'advisory';
  return 'warning';
}

export function getThermalMeta(level: ThermalLevel): ThermalLevelMeta {
  return THERMAL_SCALE_MAP[level];
}
