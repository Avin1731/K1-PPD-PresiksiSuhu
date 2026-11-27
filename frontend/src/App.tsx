import { useMemo, useState } from 'react';
import { FEATURE_META_MAP } from './data/featureMeta';
import { SCENARIO_PRESETS } from './data/presets';
import { PredictActionBar } from './components/input/PredictActionBar';
import { ScenarioPresets } from './components/input/ScenarioPresets';
import { StationSelector } from './components/input/StationSelector';
import { WeatherInputTabs } from './components/input/WeatherInputTabs';
import { DashboardHeader } from './components/layout/DashboardHeader';
import { ModeSwitcher, type WorkspaceMode } from './components/layout/ModeSwitcher';
import { HeatwaveBanner } from './components/output/HeatwaveBanner';
import { HeroPredictionCard } from './components/output/HeroPredictionCard';
import { ResultEmptyState } from './components/output/ResultEmptyState';
import { ResultErrorState } from './components/output/ResultErrorState';
import { ResultSkeleton } from './components/output/ResultSkeleton';
import { usePrediction } from './hooks/usePrediction';
import {
  MODEL_FEATURE_ORDER,
  type FeatureKey,
  type InputTabId,
  type ScenarioPreset,
  type StationPreset,
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
    refreshHealth,
    runSinglePrediction,
    clearResult,
  } = usePrediction();

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
    await runSinglePrediction({
      station_id: selectedStationId,
      features: validation.parsed,
    });
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

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      <DashboardHeader
        serviceMode={serviceMode}
        onChangeServiceMode={setServiceMode}
        checkingHealth={checkingHealth}
        healthError={healthError}
        onRefreshHealth={() => void refreshHealth(serviceMode)}
      />

      <main className="mx-auto max-w-[1360px] space-y-5 px-4 pt-5 pb-28 min-[720px]:px-6 min-[720px]:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ModeSwitcher mode={workspaceMode} onChangeMode={setWorkspaceMode} />
          <p className="text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
            Model {modelInfo.algorithm} ({modelInfo.n_estimators} trees) | R2{' '}
            {(modelInfo.metrics.r2 * 100).toFixed(2)}% | MAE {modelInfo.metrics.mae.toFixed(4)} °C
          </p>
        </div>

        {workspaceMode === 'batch' ? (
          <section className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6">
            <h2 className="text-[1.0625rem] font-semibold text-[var(--ink-primary)]">
              Mode Batch CSV (Disiapkan di Fase 4)
            </h2>
            <p className="mt-1.5 max-w-[68ch] text-[0.9375rem] text-[var(--ink-secondary)]">
              Unggah berkas CSV multi-baris, unduh template 21 fitur model, dan ekspor hasil prediksi massal akan diaktifkan setelah Fase 2 dan Fase 3 disetujui.
            </p>
            <button
              type="button"
              onClick={() => setWorkspaceMode('single')}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-[8px] bg-[var(--accent-primary)] px-4 text-[0.875rem] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Kembali ke Prediksi Tunggal
            </button>
          </section>
        ) : (
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

            {/* Kolom Kanan: Visualisasi & Hasil Prediksi (Fase 2: Hero + Banner + 3 States) */}
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
                  <HeroPredictionCard
                    prediction={result}
                    stationLabel={lastPredictedStationLabel}
                  />
                  <HeatwaveBanner level={result.heatwave_status} />
                </>
              ) : (
                <ResultEmptyState />
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
