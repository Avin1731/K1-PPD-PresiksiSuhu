import type { Locale } from '../../hooks/useLanguage';
import { UI_STRINGS } from '../../i18n/translations';

interface ResultSkeletonProps {
  locale: Locale;
}

export function ResultSkeleton({ locale }: ResultSkeletonProps) {
  const t = UI_STRINGS[locale];

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      aria-label={t.loadingLabel}
      className="space-y-4"
    >
      <p className="text-[0.875rem] font-semibold text-[var(--ink-secondary)]">
        {t.loadingLabel}
      </p>
      <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
        <div className="h-44 animate-pulse rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
          <div className="h-full rounded-[8px] bg-[var(--surface-secondary)]" />
        </div>
        <div className="h-44 animate-pulse rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
          <div className="h-full rounded-[8px] bg-[var(--surface-secondary)]" />
        </div>
      </div>
      <div className="h-20 animate-pulse rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
        <div className="h-full rounded-[8px] bg-[var(--surface-secondary)]" />
      </div>
      <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
        <div className="h-40 animate-pulse rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
          <div className="h-full rounded-[8px] bg-[var(--surface-secondary)]" />
        </div>
        <div className="h-40 animate-pulse rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
          <div className="h-full rounded-[8px] bg-[var(--surface-secondary)]" />
        </div>
      </div>
    </section>
  );
}
