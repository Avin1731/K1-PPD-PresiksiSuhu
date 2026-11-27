import type { SinglePredictResponse } from '../../types/prediction';
import { getThermalMeta } from '../../utils/thermalScale';

interface HeroPredictionCardProps {
  prediction: SinglePredictResponse;
  stationLabel: string;
}

export function HeroPredictionCard({ prediction, stationLabel }: HeroPredictionCardProps) {
  const meta = getThermalMeta(prediction.heatwave_status);
  const deltaSign = prediction.delta_t >= 0 ? '+' : '';

  return (
    <section
      aria-label="Hasil prediksi suhu maksimum esok hari"
      className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 min-[720px]:p-6"
      style={{ boxShadow: 'var(--shadow-hero)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.875rem] font-semibold text-[var(--ink-secondary)]">
          Prakiraan Suhu Maksimum Esok Hari (Next_Tmax)
        </p>
        <span
          style={{
            backgroundColor: meta.bg,
            borderColor: meta.border,
            color: meta.ink,
          }}
          className="rounded-[6px] border px-2.5 py-1 text-[0.8125rem] font-semibold"
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-[2.75rem] font-bold leading-[1.05] tracking-tight text-[var(--ink-primary)] tabular-nums min-[720px]:text-[3.5rem]">
          {prediction.predicted_tmax.toFixed(1)} °C
        </p>

        <div className="text-left min-[720px]:text-right">
          <p className="text-[0.9375rem] font-semibold text-[var(--ink-primary)] tabular-nums">
            Selisih {deltaSign}
            {prediction.delta_t.toFixed(2)} °C vs hari ini
          </p>
          <p className="text-[0.8125rem] text-[var(--ink-secondary)] tabular-nums">
            Present_Tmax hari ini: {prediction.present_tmax.toFixed(1)} °C
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
        <span>Lokasi: {stationLabel}</span>
        <span>
          Sumber:{' '}
          {prediction.is_mock
            ? 'Estimasi Simulasi FE (menunggu API model)'
            : 'API Live rf_model.joblib'}{' '}
          | {prediction.inference_ms.toFixed(2)} ms
        </span>
      </div>
    </section>
  );
}
