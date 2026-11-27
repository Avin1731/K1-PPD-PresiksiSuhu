import type { Locale } from '../hooks/useLanguage';
import { THERMAL_TEXT_MAP } from '../i18n/translations';
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

const THERMAL_STYLES: Record<
  ThermalLevel,
  { rangeLabel: string; ink: string; bg: string; border: string; gaugeColor: string }
> = {
  cool: {
    rangeLabel: '< 25.0 °C',
    ink: 'var(--thermal-cool-ink)',
    bg: 'var(--thermal-cool-bg)',
    border: 'var(--thermal-cool-border)',
    gaugeColor: 'var(--thermal-cool-gauge)',
  },
  normal: {
    rangeLabel: '25.0 - 29.9 °C',
    ink: 'var(--thermal-normal-ink)',
    bg: 'var(--thermal-normal-bg)',
    border: 'var(--thermal-normal-border)',
    gaugeColor: 'var(--thermal-normal-gauge)',
  },
  warm: {
    rangeLabel: '30.0 - 32.9 °C',
    ink: 'var(--thermal-warm-ink)',
    bg: 'var(--thermal-warm-bg)',
    border: 'var(--thermal-warm-border)',
    gaugeColor: 'var(--thermal-warm-gauge)',
  },
  advisory: {
    rangeLabel: '33.0 - 34.9 °C',
    ink: 'var(--thermal-advisory-ink)',
    bg: 'var(--thermal-advisory-bg)',
    border: 'var(--thermal-advisory-border)',
    gaugeColor: 'var(--thermal-advisory-gauge)',
  },
  warning: {
    rangeLabel: '>= 35.0 °C',
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

export function getThermalMeta(level: ThermalLevel, locale: Locale = 'id'): ThermalLevelMeta {
  return {
    level,
    ...THERMAL_STYLES[level],
    ...THERMAL_TEXT_MAP[level][locale],
  };
}
