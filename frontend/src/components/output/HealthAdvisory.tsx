import { FirstAidKit } from '@phosphor-icons/react';
import type { ThermalLevel } from '../../types/prediction';
import { getHealthAdvisories } from '../../utils/healthAdvisory';
import { getThermalMeta } from '../../utils/thermalScale';

interface HealthAdvisoryProps {
  level: ThermalLevel;
}

export function HealthAdvisory({ level }: HealthAdvisoryProps) {
  const meta = getThermalMeta(level);
  const items = getHealthAdvisories(level);

  return (
    <section
      aria-label="Rekomendasi mitigasi kesehatan warga"
      className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FirstAidKit
            size={18}
            weight="duotone"
            className="shrink-0 text-[var(--accent-text)]"
            aria-hidden="true"
          />
          <h2 className="text-[0.875rem] font-semibold text-[var(--ink-secondary)]">
            Saran Mitigasi Kesehatan Warga
          </h2>
        </div>
        <span
          style={{
            backgroundColor: meta.bg,
            borderColor: meta.border,
            color: meta.ink,
          }}
          className="rounded-[6px] border px-2 py-0.5 text-[0.75rem] font-semibold"
        >
          {meta.label}
        </span>
      </div>

      <ul className="mt-3 max-w-[65ch] space-y-2 text-[0.875rem] leading-relaxed text-[var(--ink-primary)]">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[var(--surface-secondary)] text-[0.75rem] font-bold text-[var(--ink-secondary)] tabular-nums">
              {idx + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
