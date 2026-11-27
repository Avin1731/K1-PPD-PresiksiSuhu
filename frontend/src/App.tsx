import { useMemo, useState } from 'react';
import { FEATURE_META_MAP } from './data/featureMeta';
import { SCENARIO_PRESETS } from './data/presets';
import { BatchCsvPanel } from './components/input/BatchCsvPanel';
import { PredictActionBar } from './components/input/PredictActionBar';
import { ScenarioPresets } from './components/input/ScenarioPresets';
import { StationSelector } from './components/input/StationSelector';
import { WeatherInputTabs } from './components/input/WeatherInputTabs';
import { DashboardHeader } from './components/layout/DashboardHeader';
import { ModeSwitcher, type WorkspaceMode } from './components/layout/ModeSwitcher';
import { DeltaIndicator } from './components/output/DeltaIndicator';
import { FeatureImportanceChart } from './components/output/FeatureImportanceChart';
import { HealthAdvisory } from './components/output/HealthAdvisory';
import { HeatwaveBanner } from './components/output/HeatwaveBanner';
import { HeroPredictionCard } from './components/output/HeroPredictionCard';
import { ResultEmptyState } from './components/output/ResultEmptyState';
import { ResultErrorState } from './components/output/ResultErrorState';
import { ResultSkeleton } from './components/output/ResultSkeleton';
import { SessionHistoryTable } from './components/output/SessionHistoryTable';
import { ThermalGauge } from './components/output/ThermalGauge';
import { usePrediction } from './hooks/usePrediction';
import { useSessionHistory } from './hooks/useSessionHistory';
import {
  MODEL_FEATURE_ORDER,
  type FeatureKey,
  type InputTabId,
  type ScenarioPreset,
  type SessionHistoryItem,
  type StationPreset,
  type WeatherFeatures,
} from './types/prediction';
import {
  featuresToDraft,
  validateFeatureDraft,
  type FeatureFormDraft,
  type FeatureValidationErrors,
} from './utils/validation';

const GEO_KEYS: ReadonlySet<FeatureKey> = new Set(['lat', 'lon', 'DEM', 'Slope']);

export default function App() {
  const {
    serviceMode,
    setServiceMode,
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
  } = usePrediction();

  const { history, addEntry, clearHistory } = useSessionHistory();

  const initialPreset = SCENARIO_PRESETS[0];

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('single');
  const [selectedStationId, setSelectedStationId] = useState<number>(initialPreset.station_id);
  const [isManualGeoOverride, setIsManualGeoOverride] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<ScenarioPreset['id'] | null>(
    initialPreset.id
  );
  const [activeTab, setActiveTab] = useState<InputTabId>('observation');
  const [draft, setDraft] = useState<FeatureFormDraft>(() =>
    featuresToDraft(initialPreset.features)
  );
  const [submittedValidation, setSubmittedValidation] = useState<boolean>(false);
  const [lastPredictedStationLabel, setLastPredictedStationLabel] = useState<string>(
    `Stasiun ${initialPreset.station_id}`
  );
  const [lastPredictedFeatures, setLastPredictedFeatures] = useState<WeatherFeatures>(
    initialPreset.features
  );

  const validation = useMemo(() => validateFeatureDraft(draft), [draft]);

  const combinedErrors: FeatureValidationErrors = useMemo(() => {
    const merged: FeatureValidationErrors = {};
    if (submittedValidation) {
      Object.assign(merged, validation.errors);
    }
    return { ...merged, ...serverFieldErrors };
  }, [submittedValidation, validation.errors, serverFieldErrors]);

  function handleSelectStation(station: StationPreset) {
    setSelectedStationId(station.station_id);
    setIsManualGeoOverride(false);
    setDraft((prev) => ({
      ...prev,
      lat: String(station.lat),
      lon: String(station.lon),
      DEM: String(station.DEM),
      Slope: String(station.Slope),
    }));
  }

  function handleSelectPreset(preset: ScenarioPreset) {
    setSelectedStationId(preset.station_id);
    setIsManualGeoOverride(false);
    setActivePresetId(preset.id);
    setDraft(featuresToDraft(preset.features));
    setSubmittedValidation(false);
  }

  function handleChangeField(key: FeatureKey, value: string) {
    setActivePresetId(null);
    if (GEO_KEYS.has(key)) {
      setIsManualGeoOverride(true);
    }
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePredict() {
    setSubmittedValidation(true);

    if (!validation.valid || !validation.parsed) {
      for (const key of MODEL_FEATURE_ORDER) {
        if (validation.errors[key]) {
          setActiveTab(FEATURE_META_MAP[key].tab);
          break;
        }
      }
      return;
    }

    const stationObj = stations.find((item) => item.station_id === selectedStationId);
    const stationText = stationObj
      ? stationObj.district_name
      : `Stasiun ${selectedStationId}`;
    const label = isManualGeoOverride
      ? `${stationText} (Koordinat disesuaikan)`
      : stationText;

    setLastPredictedStationLabel(label);
    setLastPredictedFeatures(validation.parsed);

    const response = await runSinglePrediction({
      station_id: selectedStationId,
      features: validation.parsed,
    });

    if (response) {
      addEntry({
        station_id: selectedStationId,
        station_label: label,
        present_tmax: response.present_tmax,
        predicted_tmax: response.predicted_tmax,
        delta_t: response.delta_t,
        heatwave_status: response.heatwave_status,
        is_mock: Boolean(response.is_mock),
        features: validation.parsed,
      });
    }
  }

  function handleReset() {
    const defaultPreset = presets[0] ?? initialPreset;
    setSelectedStationId(defaultPreset.station_id);
    setIsManualGeoOverride(false);
    setActivePresetId(defaultPreset.id);
    setActiveTab('observation');
    setDraft(featuresToDraft(defaultPreset.features));
    setSubmittedValidation(false);
    clearResult();
  }

  function handleLoadHistory(item: SessionHistoryItem) {
    if (item.station_id !== null) {
      setSelectedStationId(item.station_id);
    }
    setIsManualGeoOverride(item.station_label.includes('disesuaikan'));
    setActivePresetId(null);
    setDraft(featuresToDraft(item.features));
    setSubmittedValidation(false);
    setWorkspaceMode('single');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeFactors =
    result?.top_factors && result.top_factors.length > 0
      ? result.top_factors
      : modelInfo.feature_importances;

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      <DashboardHeader
        serviceMode={serviceMode}
        onChangeServiceMode={setServiceMode}
        checkingHealth={checkingHealth}
        healthError={healthError}
        onRefreshHealth={() => void refreshHealth(serviceMode)}
      />

      <main
        className={`mx-auto max-w-[1360px] space-y-5 px-4 pt-5 min-[720px]:px-6 min-[720px]:py-6 ${
          workspaceMode === 'single' ? 'pb-28' : 'pb-8'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ModeSwitcher mode={workspaceMode} onChangeMode={setWorkspaceMode} />
          <p className="text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
            Model {modelInfo.algorithm} ({modelInfo.n_estimators} trees) | R2{' '}
            {(modelInfo.metrics.r2 * 100).toFixed(2)}% | MAE {modelInfo.metrics.mae.toFixed(4)} °C
          </p>
        </div>

        {workspaceMode === 'batch' ? (
          <BatchCsvPanel
            presets={presets}
            loading={batchLoading}
            error={batchError}
            missingColumns={batchMissingColumns}
            result={batchResult}
            onUploadFile={(file) => void runBatchPrediction(file)}
            onClear={clearBatchResult}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 items-start gap-6 min-[1100px]:grid-cols-[46fr_54fr]">
              {/* Kolom Kiri: Kontrol Input Data */}
              <section
                aria-label="Kontrol input cuaca"
                className="min-w-0 space-y-5 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 min-[720px]:p-5"
              >
                <div className="border-b border-[var(--border-subtle)] pb-3">
                  <h2 className="text-[1.0625rem] font-semibold text-[var(--ink-primary)]">
                    Parameter Cuaca &amp; Stasiun (21 Fitur Model)
                  </h2>
                  <p className="mt-0.5 text-[0.8125rem] text-[var(--ink-secondary)]">
                    Pilih stasiun dan skenario cepat, atau ubah parameter per kategori tab.
                  </p>
                </div>

                <StationSelector
                  stations={stations}
                  selectedStationId={selectedStationId}
                  isManualGeoOverride={isManualGeoOverride}
                  onSelectStation={handleSelectStation}
                />

                <ScenarioPresets
                  presets={presets}
                  activePresetId={activePresetId}
                  onSelectPreset={handleSelectPreset}
                />

                <WeatherInputTabs
                  activeTab={activeTab}
                  onChangeTab={setActiveTab}
                  draft={draft}
                  errors={combinedErrors}
                  warnings={validation.warnings}
                  onChangeField={handleChangeField}
                />

                <PredictActionBar
                  loading={loading}
                  onPredict={() => void handlePredict()}
                  onReset={handleReset}
                />
              </section>

              {/* Kolom Kanan: Visualisasi & Hasil Prediksi */}
              <section aria-label="Hasil prediksi" className="min-w-0 space-y-4">
                {loading ? (
                  <ResultSkeleton />
                ) : error ? (
                  <ResultErrorState
                    message={error}
                    serviceMode={serviceMode}
                    onRetry={() => void handlePredict()}
                    onSwitchToMock={() => setServiceMode('mock')}
                  />
                ) : result ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
                      <HeroPredictionCard
                        prediction={result}
                        stationLabel={lastPredictedStationLabel}
                      />
                      <ThermalGauge
                        temperature={result.predicted_tmax}
                        level={result.heatwave_status}
                      />
                    </div>

                    <HeatwaveBanner level={result.heatwave_status} />

                    <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
                      <DeltaIndicator
                        presentTmax={result.present_tmax}
                        predictedTmax={result.predicted_tmax}
                        deltaT={result.delta_t}
                      />
                      <HealthAdvisory level={result.heatwave_status} />
                    </div>

                    <FeatureImportanceChart
                      factors={activeFactors}
                      inputFeatures={lastPredictedFeatures}
                    />
                  </>
                ) : (
                  <ResultEmptyState />
                )}
              </section>
            </div>

            <SessionHistoryTable
              history={history}
              onLoadHistory={handleLoadHistory}
              onClearHistory={clearHistory}
            />
          </div>
        )}
      </main>
    </div>
  );
}
