import type { ModelInfoResponse } from '../../types/prediction';

interface DashboardIntroProps {
  stationCount: number;
  modelInfo: ModelInfoResponse;
}

export function DashboardIntro({ stationCount, modelInfo }: DashboardIntroProps) {
  return (
    <section
      aria-labelledby="intro-section-heading"
      className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3.5 min-[720px]:px-5 min-[720px]:py-4"
    >
      <div className="flex flex-col gap-3 min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between min-[1100px]:gap-6">
        <div className="min-w-0 space-y-1">
          <h2
            id="intro-section-heading"
            className="text-[1rem] font-bold leading-snug text-[var(--ink-primary)] min-[720px]:text-[1.0625rem]"
          >
            Prakiraan Suhu Maksimum &amp; Peringatan Dini Gelombang Panas Seoul
          </h2>
          <p className="max-w-[72ch] text-[0.875rem] leading-relaxed text-[var(--ink-secondary)]">
            Memprediksi suhu maksimum esok hari (Next_Tmax) dan status peringatan KMA dari 21 parameter atmosfer LDAPS serta observasi di {stationCount} stasiun pengamatan cuaca Seoul.
          </p>
        </div>

        <dl className="grid shrink-0 grid-cols-3 divide-x divide-[var(--border-subtle)] rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
          <div className="px-3 py-2 text-center min-[720px]:px-4">
            <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">Stasiun AWS</dt>
            <dd className="mt-0.5 text-[0.9375rem] font-bold text-[var(--ink-primary)] tabular-nums">
              {stationCount}
            </dd>
          </div>
          <div className="px-3 py-2 text-center min-[720px]:px-4">
            <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">Akurasi R2</dt>
            <dd className="mt-0.5 text-[0.9375rem] font-bold text-[var(--ink-primary)] tabular-nums">
              {(modelInfo.metrics.r2 * 100).toFixed(2)}%
            </dd>
          </div>
          <div className="px-3 py-2 text-center min-[720px]:px-4">
            <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">Galat MAE</dt>
            <dd className="mt-0.5 text-[0.9375rem] font-bold text-[var(--ink-primary)] tabular-nums">
              {modelInfo.metrics.mae.toFixed(2)} °C
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
