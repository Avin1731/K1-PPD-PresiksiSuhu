import { useCallback, useEffect, useState } from 'react';
import {
  ArrowsClockwise,
  CheckCircle,
  CloudRain,
  SunHorizon,
  Thermometer,
  ThermometerHot,
  WarningCircle,
} from '@phosphor-icons/react';
import { DEFAULT_MODEL_INFO } from './data/modelMeta';
import { SCENARIO_PRESETS } from './data/presets';
import { SEOUL_STATIONS } from './data/stations';
import { defaultServiceMode, getServiceByMode } from './services/predictionService';
import type {
  HealthResponse,
  ModelInfoResponse,
  ScenarioPreset,
  SinglePredictResponse,
} from './types/prediction';
import { getThermalMeta, THERMAL_LEVEL_ORDER } from './utils/thermalScale';

function PresetIcon({ id }: { id: ScenarioPreset['id'] }) {
  if (id === 'heatwave') return <ThermometerHot size={18} weight="regular" aria-hidden="true" />;
  if (id === 'rain') return <CloudRain size={18} weight="regular" aria-hidden="true" />;
  return <SunHorizon size={18} weight="regular" aria-hidden="true" />;
}

export default function App() {
  const [serviceMode, setServiceMode] = useState<'live' | 'mock'>(defaultServiceMode);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(true);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse>(DEFAULT_MODEL_INFO);

  const [activePresetId, setActivePresetId] = useState<ScenarioPreset['id'] | null>(null);
  const [predicting, setPredicting] = useState<boolean>(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<SinglePredictResponse | null>(null);

  const loadEnvironmentStatus = useCallback(async (mode: 'live' | 'mock') => {
    const svc = getServiceByMode(mode);
    setCheckingHealth(true);
    setHealthError(null);

    try {
      const [healthRes, infoRes] = await Promise.all([svc.checkHealth(), svc.getModelInfo()]);
      setHealth(healthRes);
      setModelInfo(infoRes);
    } catch (err) {
      setHealth(null);
      setHealthError(
        err instanceof Error
          ? err.message
          : 'Gagal memeriksa koneksi ke server backend.'
      );
    } finally {
      setCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    void loadEnvironmentStatus(serviceMode);
  }, [serviceMode, loadEnvironmentStatus]);

  async function handleTestPreset(preset: ScenarioPreset) {
    const svc = getServiceByMode(serviceMode);
    setActivePresetId(preset.id);
    setPredicting(true);
    setPredictError(null);

    try {
      const res = await svc.predictSingle({
        station_id: preset.station_id,
        features: preset.features,
      });
      setPrediction(res);
    } catch (err) {
      setPrediction(null);
      setPredictError(
        err instanceof Error
          ? err.message
          : 'Gagal menjalankan prediksi terhadap backend.'
      );
    } finally {
      setPredicting(false);
    }
  }

  const activeThermalMeta = prediction ? getThermalMeta(prediction.heatwave_status) : null;
  const activePreset = SCENARIO_PRESETS.find((item) => item.id === activePresetId) ?? null;

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Thermometer
              size={24}
              weight="duotone"
              className="shrink-0 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <h1 className="text-[1.25rem] font-bold leading-tight tracking-tight sm:text-[1.375rem]">
              Prediksi Suhu &amp; Gelombang Panas Seoul
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Sumber layanan prediksi"
              className="inline-flex rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-0.5"
            >
              <button
                type="button"
                onClick={() => setServiceMode('live')}
                className={`min-h-[38px] rounded-[6px] px-3 text-[0.8125rem] font-semibold transition-colors ${
                  serviceMode === 'live'
                    ? 'bg-[var(--surface-primary)] text-[var(--accent-primary)] shadow-xs'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                API Flask
              </button>
              <button
                type="button"
                onClick={() => setServiceMode('mock')}
                className={`min-h-[38px] rounded-[6px] px-3 text-[0.8125rem] font-semibold transition-colors ${
                  serviceMode === 'mock'
                    ? 'bg-[var(--surface-primary)] text-[var(--accent-primary)] shadow-xs'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                Simulasi FE
              </button>
            </div>

            {checkingHealth ? (
              <span className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 text-[0.8125rem] font-medium text-[var(--ink-secondary)]">
                Memeriksa koneksi...
              </span>
            ) : healthError ? (
              <span className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[6px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] px-3 text-[0.8125rem] font-semibold text-[var(--thermal-warning-ink)]">
                <WarningCircle size={16} weight="bold" aria-hidden="true" />
                API Tidak Terhubung
              </span>
            ) : (
              <span
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-[6px] border px-3 text-[0.8125rem] font-semibold ${
                  serviceMode === 'live'
                    ? 'border-[var(--thermal-normal-border)] bg-[var(--thermal-normal-bg)] text-[var(--thermal-normal-ink)]'
                    : 'border-[var(--thermal-warm-border)] bg-[var(--thermal-warm-bg)] text-[var(--thermal-warm-ink)]'
                }`}
              >
                <CheckCircle size={16} weight="bold" aria-hidden="true" />
                {serviceMode === 'live' ? 'API Terhubung' : 'Mode Simulasi FE'}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1360px] space-y-6 px-4 py-6 sm:px-6">
        <section
          aria-labelledby="phase-1-summary-heading"
          className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 id="phase-1-summary-heading" className="text-[1.0625rem] font-semibold">
                Fondasi Frontend &amp; Koneksi Service Layer (Fase 1)
              </h2>
              <p className="mt-1 max-w-[70ch] text-[0.9375rem] text-[var(--ink-secondary)]">
                Verifikasi design tokens, 21 kontrak fitur model, 25 stasiun asli Seoul, 3 skenario nyata, serta jalur uji langsung ke backend Flask dan model Random Forest.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadEnvironmentStatus(serviceMode)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 text-[0.875rem] font-semibold text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
            >
              <ArrowsClockwise size={17} aria-hidden="true" />
              Muat Ulang Status
            </button>
          </div>

          {healthError && (
            <div
              role="alert"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] p-4 text-[var(--thermal-warning-ink)]"
            >
              <div className="flex items-start gap-2.5">
                <WarningCircle size={20} weight="bold" className="mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Gagal terhubung ke server Flask</p>
                  <p className="text-[0.875rem]">{healthError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setServiceMode('mock')}
                className="min-h-[44px] rounded-[8px] bg-[var(--surface-primary)] px-4 text-[0.875rem] font-semibold text-[var(--thermal-warning-ink)] border border-[var(--thermal-warning-border)] hover:bg-[var(--surface-secondary)]"
              >
                Uji via Simulasi FE
              </button>
            </div>
          )}

          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
              <dt className="text-[0.8125rem] font-medium text-[var(--ink-secondary)]">
                Model Aktif
              </dt>
              <dd className="mt-1 text-[1rem] font-semibold tabular-nums">
                {health ? health.model_file : 'rf_model.joblib'}
              </dd>
              <dd className="mt-0.5 text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
                {modelInfo.algorithm} ({modelInfo.n_estimators} trees)
              </dd>
            </div>

            <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
              <dt className="text-[0.8125rem] font-medium text-[var(--ink-secondary)]">
                Kinerja Evaluasi UTS
              </dt>
              <dd className="mt-1 text-[1rem] font-semibold tabular-nums">
                R2 {(modelInfo.metrics.r2 * 100).toFixed(2)}% | MAE {modelInfo.metrics.mae.toFixed(4)} °C
              </dd>
              <dd className="mt-0.5 text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
                RMSE {modelInfo.metrics.rmse.toFixed(4)} °C
              </dd>
            </div>

            <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
              <dt className="text-[0.8125rem] font-medium text-[var(--ink-secondary)]">
                Kontrak Input &amp; Stasiun
              </dt>
              <dd className="mt-1 text-[1rem] font-semibold tabular-nums">
                {modelInfo.feature_names.length} Fitur Model | {SEOUL_STATIONS.length} Stasiun
              </dd>
              <dd className="mt-0.5 text-[0.8125rem] text-[var(--ink-muted)]">
                Termasuk Slope &amp; Solar radiation (Wh/m2)
              </dd>
            </div>

            <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
              <dt className="text-[0.8125rem] font-medium text-[var(--ink-secondary)]">
                Faktor Dominan Model
              </dt>
              <dd className="mt-1 text-[1rem] font-semibold tabular-nums">
                {modelInfo.feature_importances[0]?.feature ?? 'LDAPS_Tmax_lapse'} (
                {((modelInfo.feature_importances[0]?.importance ?? 0.6952) * 100).toFixed(2)}%)
              </dd>
              <dd className="mt-0.5 text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
                Diikuti Present_Tmax ({((modelInfo.feature_importances[1]?.importance ?? 0.0537) * 100).toFixed(2)}%)
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="thermal-scale-heading"
          className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
        >
          <h2 id="thermal-scale-heading" className="text-[1.0625rem] font-semibold">
            Skala Termal 5-Level Terkalibrasi (Sinkron Gauge &amp; Banner)
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            {THERMAL_LEVEL_ORDER.map((level) => {
              const meta = getThermalMeta(level);
              return (
                <div
                  key={level}
                  style={{
                    backgroundColor: meta.bg,
                    borderColor: meta.border,
                    color: meta.ink,
                  }}
                  className="rounded-[8px] border px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.875rem] font-semibold">{meta.label}</span>
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: meta.gaugeColor }}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1 text-[0.8125rem] font-medium tabular-nums">
                    {meta.rangeLabel}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="service-smoke-heading"
          className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 lg:col-span-5">
            <h2 id="service-smoke-heading" className="text-[1.0625rem] font-semibold">
              Uji Koneksi Service Layer dengan 3 Skenario Asli
            </h2>
            <p className="mt-1 text-[0.9375rem] text-[var(--ink-secondary)]">
              Klik salah satu skenario dataset UTS di bawah untuk mengirim 21 fitur model ke{' '}
              <span className="font-semibold text-[var(--ink-primary)]">
                {serviceMode === 'live' ? 'POST /api/predict' : 'mockPredictor'}
              </span>
              .
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {SCENARIO_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={predicting}
                    onClick={() => void handleTestPreset(preset)}
                    className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[8px] border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-tint)] text-[var(--accent-primary)]'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--ink-primary)] hover:bg-[var(--surface-secondary)]'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0">
                        <PresetIcon id={preset.id} />
                      </span>
                      <div>
                        <p className="text-[0.9375rem] font-semibold">{preset.name}</p>
                        <p className="text-[0.8125rem] text-[var(--ink-secondary)] tabular-nums">
                          Stasiun {preset.station_id} | {preset.source_date} | Target{' '}
                          {preset.expected_predicted_tmax.toFixed(2)} °C
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 lg:col-span-7">
            <h2 className="text-[1.0625rem] font-semibold">Respons Prediksi</h2>

            {predicting ? (
              <div className="mt-4 space-y-3" aria-busy="true" aria-live="polite">
                <div className="h-24 animate-pulse rounded-[8px] bg-[var(--surface-secondary)]" />
                <div className="h-16 animate-pulse rounded-[8px] bg-[var(--surface-secondary)]" />
              </div>
            ) : predictError ? (
              <div
                role="alert"
                className="mt-4 rounded-[8px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] p-4 text-[var(--thermal-warning-ink)]"
              >
                <p className="font-semibold">Permintaan Prediksi Gagal</p>
                <p className="mt-1 text-[0.875rem]">{predictError}</p>
              </div>
            ) : prediction && activeThermalMeta ? (
              <div className="mt-4 space-y-4">
                <div
                  className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
                  style={{ boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[0.875rem] font-medium text-[var(--ink-secondary)] tabular-nums">
                      {activePreset ? `${activePreset.name} (Stasiun ${activePreset.station_id})` : 'Hasil Uji'}
                    </span>
                    <span
                      style={{
                        backgroundColor: activeThermalMeta.bg,
                        borderColor: activeThermalMeta.border,
                        color: activeThermalMeta.ink,
                      }}
                      className="rounded-[6px] border px-2.5 py-1 text-[0.8125rem] font-semibold"
                    >
                      {activeThermalMeta.label}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-baseline gap-4">
                    <p className="text-[2.75rem] font-bold leading-none tracking-tight tabular-nums sm:text-[3.5rem]">
                      {prediction.predicted_tmax.toFixed(2)} °C
                    </p>
                    <p className="text-[0.9375rem] font-medium text-[var(--ink-secondary)] tabular-nums">
                      Selisih hari ini: {prediction.delta_t >= 0 ? '+' : ''}
                      {prediction.delta_t.toFixed(2)} °C (Present_Tmax {prediction.present_tmax.toFixed(1)} °C)
                    </p>
                  </div>

                  <p className="mt-3 text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
                    Sumber: {prediction.is_mock ? 'Estimasi Simulasi FE' : 'API Live rf_model.joblib'} | Waktu
                    inferensi: {prediction.inference_ms} ms
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: activeThermalMeta.bg,
                    borderColor: activeThermalMeta.border,
                    color: activeThermalMeta.ink,
                  }}
                  className="rounded-[8px] border p-4"
                >
                  <p className="text-[0.9375rem] font-semibold">{activeThermalMeta.bannerTitle}</p>
                  <p className="mt-1 text-[0.875rem]">{activeThermalMeta.bannerDescription}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[8px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-6 text-center">
                <p className="text-[0.9375rem] font-semibold text-[var(--ink-primary)]">
                  Belum ada uji prediksi dijalankan
                </p>
                <p className="mt-1 text-[0.875rem] text-[var(--ink-secondary)]">
                  Pilih salah satu dari 3 skenario asli di sebelah kiri untuk menguji endpoint prediksi dan skala termal.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
