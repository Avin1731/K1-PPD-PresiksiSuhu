import { useMemo, useState } from 'react';
import { FEATURE_META_MAP } from './data/featureMeta';
import { SCENARIO_PRESETS } from './data/presets';
import { BatchCsvPanel } from './components/input/BatchCsvPanel';
import { PredictActionBar } from './components/input/PredictActionBar';
import { ScenarioPresets } from './components/input/ScenarioPresets';
import { StationSelector } from './components/input/StationSelector';
import { WeatherInputTabs } from './components/input/WeatherInputTabs';
import { DashboardFooter } from './components/layout/DashboardFooter';
import { DashboardHeader } from './components/layout/DashboardHeader';
import { DashboardIntro } from './components/layout/DashboardIntro';
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
import { useLanguage } from './hooks/useLanguage';
import { usePrediction } from './hooks/usePrediction';
import { useSessionHistory } from './hooks/useSessionHistory';
import { useTheme } from './hooks/useTheme';
import { UI_STRINGS } from './i18n/translations';
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
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useLanguage();
  const t = UI_STRINGS[locale];

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
  const [lastPredictedStationId, setLastPredictedStationId] = useState<number>(
    initialPreset.station_id
  );
  const [lastPredictedManualGeo, setLastPredictedManualGeo] = useState<boolean>(false);
  const [lastPredictedFeatures, setLastPredictedFeatures] = useState<WeatherFeatures>(
    initialPreset.features
  );

  const validation = useMemo(() => validateFeatureDraft(draft, locale), [draft, locale]);

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

    const label = isManualGeoOverride
      ? `${t.stationPrefix} ${selectedStationId} ${t.stationManualSuffix}`
      : `${t.stationPrefix} ${selectedStationId}`;

    setLastPredictedStationId(selectedStationId);
    setLastPredictedManualGeo(isManualGeoOverride);
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
    setIsManualGeoOverride(
      item.station_label.includes('disesuaikan') || item.station_label.includes('adjusted')
    );
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

  const displayedStationLabel = lastPredictedManualGeo
    ? `${t.stationPrefix} ${lastPredictedStationId} ${t.stationManualSuffix}`
    : `${t.stationPrefix} ${lastPredictedStationId}`;

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      <DashboardHeader
        serviceMode={serviceMode}
        onChangeServiceMode={setServiceMode}
        checkingHealth={checkingHealth}
        healthError={healthError}
        onRefreshHealth={() => void refreshHealth(serviceMode)}
        theme={theme}
        onToggleTheme={toggleTheme}
        locale={locale}
        onChangeLocale={setLocale}
      />

      <main className="mx-auto w-full max-w-[1360px] flex-1 space-y-5 px-4 py-5 min-[720px]:px-6 min-[720px]:py-6">
        <DashboardIntro stationCount={stations.length} modelInfo={modelInfo} locale={locale} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <ModeSwitcher mode={workspaceMode} onChangeMode={setWorkspaceMode} locale={locale} />
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
            locale={locale}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 items-start gap-6 min-[1100px]:grid-cols-[46fr_54fr]">
              {/* Kolom Kiri: Kontrol Input Data */}
              <section
                aria-label={t.inputPanelTitle}
                className="min-w-0 space-y-5 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 min-[720px]:p-5"
              >
                <div className="border-b border-[var(--border-subtle)] pb-3">
                  <h2 className="text-[1.0625rem] font-semibold text-[var(--ink-primary)]">
                    {t.inputPanelTitle}
                  </h2>
                  <p className="mt-0.5 text-[0.8125rem] text-[var(--ink-secondary)]">
                    {t.inputPanelSubtitle}
                  </p>
                </div>

                <StationSelector
                  stations={stations}
                  selectedStationId={selectedStationId}
                  isManualGeoOverride={isManualGeoOverride}
                  onSelectStation={handleSelectStation}
                  locale={locale}
                />

                <ScenarioPresets
                  presets={presets}
                  activePresetId={activePresetId}
                  onSelectPreset={handleSelectPreset}
                  locale={locale}
                />

                <WeatherInputTabs
                  activeTab={activeTab}
                  onChangeTab={setActiveTab}
                  draft={draft}
                  errors={combinedErrors}
                  warnings={validation.warnings}
                  onChangeField={handleChangeField}
                  locale={locale}
                />

                <PredictActionBar
                  loading={loading}
                  onPredict={() => void handlePredict()}
                  onReset={handleReset}
                  locale={locale}
                />
              </section>

              {/* Kolom Kanan: Visualisasi & Hasil Prediksi */}
              <section aria-label={t.heroTitle} className="min-w-0 space-y-4">
                {loading ? (
                  <ResultSkeleton locale={locale} />
                ) : error ? (
                  <ResultErrorState
                    message={error}
                    serviceMode={serviceMode}
                    onRetry={() => void handlePredict()}
                    onSwitchToMock={() => setServiceMode('mock')}
                    locale={locale}
                  />
                ) : result ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
                      <HeroPredictionCard
                        prediction={result}
                        stationLabel={displayedStationLabel}
                        locale={locale}
                      />
                      <ThermalGauge
                        temperature={result.predicted_tmax}
                        level={result.heatwave_status}
                        locale={locale}
                      />
                    </div>

                    <HeatwaveBanner level={result.heatwave_status} locale={locale} />

                    <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
                      <DeltaIndicator
                        presentTmax={result.present_tmax}
                        predictedTmax={result.predicted_tmax}
                        deltaT={result.delta_t}
                        locale={locale}
                      />
                      <HealthAdvisory level={result.heatwave_status} locale={locale} />
                    </div>

                    <FeatureImportanceChart
                      factors={activeFactors}
                      inputFeatures={lastPredictedFeatures}
                      locale={locale}
                    />
                  </>
                ) : (
                  <ResultEmptyState locale={locale} />
                )}
              </section>
            </div>

            <SessionHistoryTable
              history={history}
              onLoadHistory={handleLoadHistory}
              onClearHistory={clearHistory}
              locale={locale}
            />
          </div>
        )}
      </main>

      <DashboardFooter isSingleMode={workspaceMode === 'single'} locale={locale} />
    </div>
  );
}
