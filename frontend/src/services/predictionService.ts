import { SCENARIO_PRESETS } from '../data/presets';
import { SEOUL_STATIONS } from '../data/stations';
import type {
  BatchPredictResponse,
  HealthResponse,
  ModelInfoResponse,
  PredictionService,
  ScenarioPreset,
  SinglePredictRequest,
  SinglePredictResponse,
  StationPreset,
} from '../types/prediction';
import { classifyThermalLevel } from '../utils/thermalScale';
import { requestJson } from './httpClient';
import { mockPredictionService } from './mockPredictor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || 'false').toLowerCase() === 'true';
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000);

export const httpPredictionService: PredictionService = {
  getMode() {
    return 'live';
  },

  checkHealth() {
    return requestJson<HealthResponse>(API_BASE_URL, '/api/health', {
      method: 'GET',
      timeoutMs: TIMEOUT_MS,
    });
  },

  getModelInfo() {
    return requestJson<ModelInfoResponse>(API_BASE_URL, '/api/model-info', {
      method: 'GET',
      timeoutMs: TIMEOUT_MS,
    });
  },

  async getStations(): Promise<StationPreset[]> {
    try {
      const data = await requestJson<{ stations: StationPreset[] }>(
        API_BASE_URL,
        '/api/stations',
        {
          method: 'GET',
          timeoutMs: TIMEOUT_MS,
        }
      );
      return data.stations.length > 0 ? data.stations : SEOUL_STATIONS;
    } catch {
      return SEOUL_STATIONS;
    }
  },

  async getPresets(): Promise<ScenarioPreset[]> {
    try {
      const data = await requestJson<{ presets: ScenarioPreset[] }>(
        API_BASE_URL,
        '/api/presets',
        {
          method: 'GET',
          timeoutMs: TIMEOUT_MS,
        }
      );
      return data.presets.length > 0 ? data.presets : SCENARIO_PRESETS;
    } catch {
      return SCENARIO_PRESETS;
    }
  },

  async predictSingle(payload: SinglePredictRequest): Promise<SinglePredictResponse> {
    const res = await requestJson<SinglePredictResponse>(API_BASE_URL, '/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      timeoutMs: TIMEOUT_MS,
    });

    const present =
      typeof res.present_tmax === 'number'
        ? res.present_tmax
        : Math.round(payload.features.Present_Tmax * 100) / 100;
    const delta =
      typeof res.delta_t === 'number'
        ? res.delta_t
        : Math.round((res.predicted_tmax - present) * 100) / 100;

    return {
      ...res,
      present_tmax: present,
      delta_t: delta,
      heatwave_status: res.heatwave_status ?? classifyThermalLevel(res.predicted_tmax),
      is_mock: false,
    };
  },

  predictBatch(file: File): Promise<BatchPredictResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return requestJson<BatchPredictResponse>(API_BASE_URL, '/api/predict/batch', {
      method: 'POST',
      body: formData,
      timeoutMs: Math.max(TIMEOUT_MS, 30000),
    });
  },
};

export function getServiceByMode(mode: 'mock' | 'live'): PredictionService {
  return mode === 'mock' ? mockPredictionService : httpPredictionService;
}

export const defaultServiceMode: 'mock' | 'live' = USE_MOCK ? 'mock' : 'live';
export const predictionService: PredictionService = getServiceByMode(defaultServiceMode);
