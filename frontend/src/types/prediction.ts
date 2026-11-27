export type ThermalLevel = 'cool' | 'normal' | 'warm' | 'advisory' | 'warning';

export type InputTabId = 'location' | 'observation' | 'ldaps';

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

export interface SessionHistoryItem {
  id: string;
  timestamp: string;
  station_id: number | null;
  station_label: string;
  present_tmax: number;
  predicted_tmax: number;
  delta_t: number;
  heatwave_status: ThermalLevel;
  is_mock: boolean;
  features: WeatherFeatures;
}

export interface PredictionService {
  getMode(): 'mock' | 'live';
  checkHealth(): Promise<HealthResponse>;
  getModelInfo(): Promise<ModelInfoResponse>;
  getStations(): Promise<StationPreset[]>;
  getPresets(): Promise<ScenarioPreset[]>;
  predictSingle(payload: SinglePredictRequest): Promise<SinglePredictResponse>;
  predictBatch(file: File): Promise<BatchPredictResponse>;
}
