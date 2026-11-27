import { Minus, TrendDown, TrendUp } from '@phosphor-icons/react';

interface DeltaIndicatorProps {
  presentTmax: number;
  predictedTmax: number;
  deltaT: number;
}

export function DeltaIndicator({ presentTmax, predictedTmax, deltaT }: DeltaIndicatorProps) {
  const absDelta = Math.abs(deltaT);
  const isStable = absDelta < 0.2;
  const isWarmer = deltaT >= 0.2;
  const sign = deltaT >= 0 ? '+' : '';

  const headline = isStable
    ? 'Relatif stabil dibanding hari ini'
    : isWarmer
      ? 'Besok diprakirakan lebih terik'
      : 'Besok diprakirakan lebih sejuk';

  const toneStyle = isStable
    ? {
        bg: 'var(--surface-secondary)',
        border: 'var(--border-subtle)',
        ink: 'var(--ink-primary)',
      }
    : isWarmer
      ? {
          bg: 'var(--thermal-advisory-bg)',
          border: 'var(--thermal-advisory-border)',
          ink: 'var(--thermal-advisory-ink)',
        }
      : {
          bg: 'var(--thermal-cool-bg)',
          border: 'var(--thermal-cool-border)',
          ink: 'var(--thermal-cool-ink)',
        };

  return (
    <section
      aria-label="Perbandingan selisih suhu terhadap hari ini"
      className="flex flex-col justify-between rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
    >
      <div>
        <h2 className="text-[0.875rem] font-semibold text-[var(--ink-secondary)]">
          Selisih Suhu vs Hari Ini (Delta T)
        </h2>

        <div className="mt-3 flex items-center gap-3">
          <div
            style={{
              backgroundColor: toneStyle.bg,
              borderColor: toneStyle.border,
              color: toneStyle.ink,
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border"
          >
            {isStable ? (
              <Minus size={22} weight="bold" aria-hidden="true" />
            ) : isWarmer ? (
              <TrendUp size={22} weight="bold" aria-hidden="true" />
            ) : (
              <TrendDown size={22} weight="bold" aria-hidden="true" />
            )}
          </div>

          <div>
            <p className="text-[1.5rem] font-bold leading-tight text-[var(--ink-primary)] tabular-nums">
              {sign}
              {deltaT.toFixed(2)} °C
            </p>
            <p className="text-[0.875rem] font-medium text-[var(--ink-secondary)]">{headline}</p>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div>
          <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">
            Hari Ini (Present_Tmax)
          </dt>
          <dd className="text-[0.9375rem] font-semibold text-[var(--ink-primary)] tabular-nums">
            {presentTmax.toFixed(1)} °C
          </dd>
        </div>
        <div>
          <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">
            Esok Hari (Next_Tmax)
          </dt>
          <dd className="text-[0.9375rem] font-semibold text-[var(--ink-primary)] tabular-nums">
            {predictedTmax.toFixed(1)} °C
          </dd>
        </div>
      </dl>
    </section>
  );
}
