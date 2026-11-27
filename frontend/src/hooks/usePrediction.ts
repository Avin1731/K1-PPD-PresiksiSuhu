import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_MODEL_INFO } from '../data/modelMeta';
import { SCENARIO_PRESETS } from '../data/presets';
import { SEOUL_STATIONS } from '../data/stations';
import { HttpApiError } from '../services/httpClient';
import { defaultServiceMode, getServiceByMode } from '../services/predictionService';
import type {
  BatchPredictResponse,
  HealthResponse,
  ModelInfoResponse,
  ScenarioPreset,
  SinglePredictRequest,
  SinglePredictResponse,
  StationPreset,
} from '../types/prediction';
import { validateCsvFileClient } from '../utils/csvParser';
import type { FeatureValidationErrors } from '../utils/validation';

export function usePrediction() {
  const [serviceMode, setServiceMode] = useState<'live' | 'mock'>(defaultServiceMode);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(true);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse>(DEFAULT_MODEL_INFO);
  const [stations, setStations] = useState<StationPreset[]>(SEOUL_STATIONS);
  const [presets, setPresets] = useState<ScenarioPreset[]>(SCENARIO_PRESETS);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<FeatureValidationErrors>({});
  const [result, setResult] = useState<SinglePredictResponse | null>(null);

  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchMissingColumns, setBatchMissingColumns] = useState<string[]>([]);
  const [batchResult, setBatchResult] = useState<BatchPredictResponse | null>(null);

  const refreshHealth = useCallback(
    async (mode: 'live' | 'mock' = serviceMode) => {
      const svc = getServiceByMode(mode);
      setCheckingHealth(true);
      setHealthError(null);

      try {
        const [healthRes, infoRes, stationsRes, presetsRes] = await Promise.all([
          svc.checkHealth(),
          svc.getModelInfo(),
          svc.getStations(),
          svc.getPresets(),
        ]);
        setHealth(healthRes);
        setModelInfo(infoRes);
        if (stationsRes.length > 0) setStations(stationsRes);
        if (presetsRes.length > 0) setPresets(presetsRes);
      } catch (err) {
        setHealth(null);
        setHealthError(
          err instanceof Error ? err.message : 'Gagal memeriksa koneksi ke server backend.'
        );
      } finally {
        setCheckingHealth(false);
      }
    },
    [serviceMode]
  );

  useEffect(() => {
    void refreshHealth(serviceMode);
  }, [serviceMode, refreshHealth]);

  const runSinglePrediction = useCallback(
    async (payload: SinglePredictRequest): Promise<SinglePredictResponse | null> => {
      const svc = getServiceByMode(serviceMode);
      setLoading(true);
      setError(null);
      setServerFieldErrors({});

      try {
        const response = await svc.predictSingle(payload);
        setResult(response);
        return response;
      } catch (err) {
        if (err instanceof HttpApiError && err.details?.field_errors) {
          setServerFieldErrors(err.details.field_errors);
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal menghitung prediksi suhu. Periksa kembali koneksi atau input Anda.'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [serviceMode]
  );

  const runBatchPrediction = useCallback(
    async (file: File): Promise<BatchPredictResponse | null> => {
      const precheck = await validateCsvFileClient(file);
      if (!precheck.valid) {
        setBatchResult(null);
        setBatchError(precheck.message);
        setBatchMissingColumns(precheck.missingColumns ?? []);
        return null;
      }

      const svc = getServiceByMode(serviceMode);
      setBatchLoading(true);
      setBatchError(null);
      setBatchMissingColumns([]);

      try {
        const response = await svc.predictBatch(file);
        setBatchResult(response);
        return response;
      } catch (err) {
        setBatchResult(null);
        if (err instanceof HttpApiError && err.details?.missing_columns) {
          setBatchMissingColumns(err.details.missing_columns);
        }
        setBatchError(
          err instanceof Error
            ? err.message
            : 'Gagal memproses file CSV. Periksa kembali isi berkas atau koneksi server.'
        );
        return null;
      } finally {
        setBatchLoading(false);
      }
    },
    [serviceMode]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setServerFieldErrors({});
  }, []);

  const clearBatchResult = useCallback(() => {
    setBatchResult(null);
    setBatchError(null);
    setBatchMissingColumns([]);
  }, []);

  return {
    serviceMode,
    setServiceMode,
    health,
    healthError,
    checkingHealth,
    modelInfo,
    stations,
    presets,
    loading,
    error,
    serverFieldErrors,
    result,
    batchLoading,
    batchError,
    batchMissingColumns,
    batchResult,
    refreshHealth,
    runSinglePrediction,
    runBatchPrediction,
    clearResult,
    clearBatchResult,
  };
}
