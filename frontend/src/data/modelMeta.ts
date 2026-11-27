import { MODEL_FEATURE_ORDER, type FeatureImportanceItem, type ModelInfoResponse } from '../types/prediction';

export const GLOBAL_FEATURE_IMPORTANCES: FeatureImportanceItem[] = [
  { feature: 'LDAPS_Tmax_lapse', importance: 0.6952 },
  { feature: 'Present_Tmax', importance: 0.0537 },
  { feature: 'LDAPS_CC1', importance: 0.0306 },
  { feature: 'LDAPS_CC3', importance: 0.0242 },
  { feature: 'LDAPS_CC4', importance: 0.0229 },
  { feature: 'LDAPS_WS', importance: 0.0214 },
  { feature: 'Solar radiation', importance: 0.018 },
  { feature: 'LDAPS_Tmin_lapse', importance: 0.017 },
  { feature: 'Present_Tmin', importance: 0.0149 },
  { feature: 'LDAPS_CC2', importance: 0.0144 },
  { feature: 'LDAPS_LH', importance: 0.0137 },
  { feature: 'LDAPS_RHmin', importance: 0.0136 },
  { feature: 'LDAPS_RHmax', importance: 0.0117 },
  { feature: 'LDAPS_PPT2', importance: 0.0088 },
  { feature: 'LDAPS_PPT1', importance: 0.0083 },
  { feature: 'DEM', importance: 0.0081 },
  { feature: 'LDAPS_PPT3', importance: 0.0062 },
  { feature: 'lon', importance: 0.0056 },
  { feature: 'LDAPS_PPT4', importance: 0.0047 },
  { feature: 'lat', importance: 0.0037 },
  { feature: 'Slope', importance: 0.0034 },
];

export const DEFAULT_MODEL_INFO: ModelInfoResponse = {
  algorithm: 'RandomForestRegressor',
  n_estimators: 100,
  target: 'Next_Tmax',
  unit: 'C',
  metrics: {
    r2: 0.8933,
    mae: 0.743,
    rmse: 1.0023,
  },
  feature_names: [...MODEL_FEATURE_ORDER],
  feature_importances: GLOBAL_FEATURE_IMPORTANCES,
};
