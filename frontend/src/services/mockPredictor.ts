import { DEFAULT_MODEL_INFO, GLOBAL_FEATURE_IMPORTANCES } from '../data/modelMeta';
import { SCENARIO_PRESETS } from '../data/presets';
import { SEOUL_STATIONS } from '../data/stations';
import {
  MODEL_FEATURE_ORDER,
  type BatchPredictResponse,
  type BatchRowResult,
  type HealthResponse,
  type ModelInfoResponse,
  type PredictionService,
  type ScenarioPreset,
  type SinglePredictRequest,
  type SinglePredictResponse,
  type StationPreset,
  type WeatherFeatures,
} from '../types/prediction';
import { classifyThermalLevel } from '../utils/thermalScale';
import { HttpApiError } from './httpClient';

const MAX_CSV_BYTES = 5 * 1024 * 1024;
const MAX_CSV_ROWS = 5000;

function estimateNextTmax(features: WeatherFeatures): number {
  const avgCloud =
    (features.LDAPS_CC1 + features.LDAPS_CC2 + features.LDAPS_CC3 + features.LDAPS_CC4) / 4;
  const totalRain =
    features.LDAPS_PPT1 + features.LDAPS_PPT2 + features.LDAPS_PPT3 + features.LDAPS_PPT4;
  const solarFactor = (features['Solar radiation'] - 5422.8) / 1000;
  const elevationCooling = (features.DEM - 50) * 0.004;

  const rawEstimate =
    0.72 * features.LDAPS_Tmax_lapse +
    0.26 * features.Present_Tmax +
    0.04 * features.LDAPS_Tmin_lapse -
    0.9 * avgCloud -
    0.08 * Math.min(totalRain, 15) +
    0.35 * solarFactor -
    elevationCooling;

  const clamped = Math.max(17.4, Math.min(37.8, rawEstimate));
  return Math.round(clamped * 100) / 100;
}

function parseCsvLine(line: string): string[] {
  return line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''));
}

/** Simulator lokal FE yang mematuhi kontrak API ketika backend belum aktif. */
export const mockPredictionService: PredictionService = {
  getMode() {
    return 'mock';
  },

  async checkHealth(): Promise<HealthResponse> {
    return {
      status: 'ok',
      model_loaded: true,
      model_file: 'rf_model.joblib (Mode Simulasi FE)',
      n_features: 21,
      sklearn_version: 'simulasi-fe',
    };
  },

  async getModelInfo(): Promise<ModelInfoResponse> {
    return DEFAULT_MODEL_INFO;
  },

  async getStations(): Promise<StationPreset[]> {
    return SEOUL_STATIONS;
  },

  async getPresets(): Promise<ScenarioPreset[]> {
    return SCENARIO_PRESETS;
  },

  async predictSingle(payload: SinglePredictRequest): Promise<SinglePredictResponse> {
    const start = performance.now();
    const predicted = estimateNextTmax(payload.features);
    const present = Math.round(payload.features.Present_Tmax * 100) / 100;
    const delta = Math.round((predicted - present) * 100) / 100;
    const inferenceMs = Math.max(1.2, Math.round((performance.now() - start + 2.4) * 100) / 100);

    return {
      predicted_tmax: predicted,
      present_tmax: present,
      delta_t: delta,
      heatwave_status: classifyThermalLevel(predicted),
      inference_ms: inferenceMs,
      top_factors: GLOBAL_FEATURE_IMPORTANCES.slice(0, 7).map((item) => ({
        feature: item.feature,
        importance: item.importance,
        value: Math.round(payload.features[item.feature] * 10000) / 10000,
      })),
      is_mock: true,
    };
  },

  async predictBatch(file: File): Promise<BatchPredictResponse> {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new HttpApiError(400, 'INVALID_CSV', 'Berkas unggahan harus berekstensi .csv.');
    }
    if (file.size > MAX_CSV_BYTES) {
      throw new HttpApiError(
        413,
        'PAYLOAD_TOO_LARGE',
        'Ukuran file CSV melebihi batas maksimal 5 MB.'
      );
    }

    const text = await file.text();
    const lines = text
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '');

    if (lines.length < 2) {
      throw new HttpApiError(400, 'INVALID_CSV', 'File CSV tidak memiliki baris data.');
    }

    const dataRowCount = lines.length - 1;
    if (dataRowCount > MAX_CSV_ROWS) {
      throw new HttpApiError(
        413,
        'PAYLOAD_TOO_LARGE',
        `Jumlah baris melebihi batas maksimal ${MAX_CSV_ROWS} baris.`
      );
    }

    const headers = parseCsvLine(lines[0]).map((col) =>
      col === 'Solar_radiation' ? 'Solar radiation' : col
    );
    const missingColumns = MODEL_FEATURE_ORDER.filter((col) => !headers.includes(col));

    if (missingColumns.length > 0) {
      throw new HttpApiError(400, 'INVALID_CSV', 'Kolom wajib pada CSV belum lengkap.', {
        missing_columns: missingColumns,
      });
    }

    const start = performance.now();
    const rows: BatchRowResult[] = [];
    const predictedVals: number[] = [];
    const dateIdx = headers.indexOf('Date');
    const stationIdx = headers.indexOf('station');

    for (let i = 1; i < lines.length; i += 1) {
      const cells = parseCsvLine(lines[i]);
      const labelParts: string[] = [];
      if (dateIdx >= 0 && cells[dateIdx]) labelParts.push(cells[dateIdx]);
      if (stationIdx >= 0 && cells[stationIdx]) labelParts.push(`Stasiun ${cells[stationIdx]}`);
      const rowLabel = labelParts.length > 0 ? labelParts.join(' | ') : `Baris ${i}`;

      const featValues = {} as WeatherFeatures;
      const invalidCols: string[] = [];

      for (const feat of MODEL_FEATURE_ORDER) {
        const colIdx = headers.indexOf(feat);
        const rawVal = cells[colIdx] ?? '';
        const num = rawVal === '' ? Number.NaN : Number(rawVal);
        if (!Number.isFinite(num)) {
          invalidCols.push(feat);
        } else {
          featValues[feat] = num;
        }
      }

      if (invalidCols.length > 0) {
        const presentCellIdx = headers.indexOf('Present_Tmax');
        const presentMaybe = presentCellIdx >= 0 ? Number(cells[presentCellIdx]) : Number.NaN;
        rows.push({
          row_index: i,
          row_label: rowLabel,
          present_tmax: Number.isFinite(presentMaybe) ? Math.round(presentMaybe * 100) / 100 : null,
          predicted_tmax: null,
          delta_t: null,
          heatwave_status: null,
          error: `Nilai kosong atau bukan angka pada kolom: ${invalidCols.slice(0, 3).join(', ')}.`,
        });
      } else {
        const pred = estimateNextTmax(featValues);
        const present = Math.round(featValues.Present_Tmax * 100) / 100;
        const delta = Math.round((pred - present) * 100) / 100;
        predictedVals.push(pred);
        rows.push({
          row_index: i,
          row_label: rowLabel,
          present_tmax: present,
          predicted_tmax: pred,
          delta_t: delta,
          heatwave_status: classifyThermalLevel(pred),
          error: null,
        });
      }
    }

    const inferenceMs = Math.max(2.1, Math.round((performance.now() - start + 3.0) * 100) / 100);
    const advisoryCount = rows.filter((r) => r.heatwave_status === 'advisory').length;
    const warningCount = rows.filter((r) => r.heatwave_status === 'warning').length;

    return {
      total_rows: dataRowCount,
      processed_rows: predictedVals.length,
      failed_rows: dataRowCount - predictedVals.length,
      inference_ms: inferenceMs,
      summary: {
        min_tmax:
          predictedVals.length > 0 ? Math.round(Math.min(...predictedVals) * 100) / 100 : null,
        max_tmax:
          predictedVals.length > 0 ? Math.round(Math.max(...predictedVals) * 100) / 100 : null,
        avg_tmax:
          predictedVals.length > 0
            ? Math.round(
                (predictedVals.reduce((acc, v) => acc + v, 0) / predictedVals.length) * 100
              ) / 100
            : null,
        advisory_count: advisoryCount,
        warning_count: warningCount,
      },
      rows,
      is_mock: true,
    };
  },
};
