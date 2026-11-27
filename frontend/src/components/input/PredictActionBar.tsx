import { ArrowCounterClockwise, Thermometer } from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import { UI_STRINGS } from '../../i18n/translations';

interface PredictActionBarProps {
  loading: boolean;
  onPredict: () => void;
  onReset: () => void;
  locale: Locale;
}

export function PredictActionBar({
  loading,
  onPredict,
  onReset,
  locale,
}: PredictActionBarProps) {
  const t = UI_STRINGS[locale];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 pt-3 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] min-[720px]:static min-[720px]:border-t min-[720px]:bg-transparent min-[720px]:px-0 min-[720px]:pt-4 min-[720px]:pb-0 min-[720px]:shadow-none"
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-[1360px] items-center gap-3 min-[720px]:px-0">
        <button
          type="button"
          disabled={loading}
          onClick={onPredict}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[var(--accent-primary)] px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-65"
        >
          <Thermometer size={19} weight="bold" aria-hidden="true" />
          {loading ? t.predictBtnLoading : t.predictBtn}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onReset}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 text-[0.875rem] font-semibold text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowCounterClockwise size={17} aria-hidden="true" />
          {t.resetBtn}
        </button>
      </div>
    </div>
  );
}
