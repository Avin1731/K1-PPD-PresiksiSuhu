import { Thermometer } from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import { UI_STRINGS } from '../../i18n/translations';
import { getThermalMeta, THERMAL_LEVEL_ORDER } from '../../utils/thermalScale';

interface ResultEmptyStateProps {
  locale: Locale;
}

export function ResultEmptyState({ locale }: ResultEmptyStateProps) {
  const t = UI_STRINGS[locale];

  return (
    <section
      aria-label={t.emptyTitle}
      className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--accent-text)]">
          <Thermometer size={20} weight="duotone" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-[1.0625rem] font-semibold text-[var(--ink-primary)]">
            {t.emptyTitle}
          </h2>
          <p className="mt-1 max-w-[65ch] text-[0.9375rem] text-[var(--ink-secondary)]">
            {t.emptyBodyPrefix}{' '}
            <strong className="font-semibold text-[var(--ink-primary)]">{t.predictBtn}</strong>.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[0.8125rem] font-semibold text-[var(--ink-secondary)]">
          {t.emptyScaleHeading}
        </p>
        <div className="mt-2.5 grid grid-cols-1 gap-2 min-[720px]:grid-cols-5">
          {THERMAL_LEVEL_ORDER.map((level) => {
            const meta = getThermalMeta(level, locale);
            return (
              <div
                key={level}
                style={{
                  backgroundColor: meta.bg,
                  borderColor: meta.border,
                  color: meta.ink,
                }}
                className="rounded-[8px] border px-3 py-2"
              >
                <p className="text-[0.8125rem] font-semibold">{meta.label}</p>
                <p className="mt-0.5 text-[0.75rem] font-medium tabular-nums">
                  {meta.rangeLabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
