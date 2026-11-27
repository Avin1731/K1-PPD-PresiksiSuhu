import { FEATURE_META_LIST, FEATURE_META_MAP } from '../data/featureMeta';
import type { Locale } from '../hooks/useLanguage';
import { FEATURE_EN_MAP, UI_STRINGS } from '../i18n/translations';
import {
  MODEL_FEATURE_ORDER,
  type FeatureKey,
  type InputTabId,
  type WeatherFeatures,
} from '../types/prediction';

export type FeatureFormDraft = Record<FeatureKey, string>;
export type FeatureValidationErrors = Partial<Record<FeatureKey, string>>;

export interface FeatureValidationResult {
  valid: boolean;
  parsed: WeatherFeatures | null;
  errors: FeatureValidationErrors;
  warnings: FeatureValidationErrors;
}

export function featuresToDraft(features: WeatherFeatures): FeatureFormDraft {
  const draft = {} as FeatureFormDraft;
  for (const key of MODEL_FEATURE_ORDER) {
    draft[key] = String(features[key]);
  }
  return draft;
}

/** Validasi seluruh 21 input cuaca sebagai angka finite dan cek rentang split model. */
export function validateFeatureDraft(
  draft: FeatureFormDraft,
  locale: Locale = 'id'
): FeatureValidationResult {
  const errors: FeatureValidationErrors = {};
  const warnings: FeatureValidationErrors = {};
  const parsed = {} as WeatherFeatures;
  const str = UI_STRINGS[locale];

  for (const key of MODEL_FEATURE_ORDER) {
    const raw = (draft[key] ?? '').trim();
    const meta = FEATURE_META_MAP[key];
    const label = locale === 'en' ? FEATURE_EN_MAP[key].label : meta.label;

    if (!raw) {
      errors[key] = str.validationRequired(label);
      continue;
    }

    const num = Number(raw);
    if (!Number.isFinite(num)) {
      errors[key] = str.validationInvalidNumber(label);
      continue;
    }

    parsed[key] = num;

    if (num < meta.min || num > meta.max) {
      warnings[key] = str.validationOutOfRange(meta.min, meta.max, meta.unit);
    }
  }

  if (
    parsed.Present_Tmax !== undefined &&
    parsed.Present_Tmin !== undefined &&
    parsed.Present_Tmin > parsed.Present_Tmax
  ) {
    errors.Present_Tmin = str.validationTminGtTmax;
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid,
    parsed: valid ? parsed : null,
    errors,
    warnings,
  };
}

/** Hitung jumlah error validasi untuk masing-masing tab input F-UI-03. */
export function countErrorsByTab(errors: FeatureValidationErrors): Record<InputTabId, number> {
  const counts: Record<InputTabId, number> = {
    location: 0,
    observation: 0,
    ldaps: 0,
  };

  for (const meta of FEATURE_META_LIST) {
    if (errors[meta.key]) {
      counts[meta.tab] += 1;
    }
  }

  return counts;
}
