import { ArrowsClockwise, WarningCircle } from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import { UI_STRINGS } from '../../i18n/translations';

interface ResultErrorStateProps {
  message: string;
  serviceMode: 'live' | 'mock';
  onRetry: () => void;
  onSwitchToMock: () => void;
  locale: Locale;
}

export function ResultErrorState({
  message,
  serviceMode,
  onRetry,
  onSwitchToMock,
  locale,
}: ResultErrorStateProps) {
  const t = UI_STRINGS[locale];

  return (
    <section
      role="alert"
      aria-label={t.errorTitle}
      className="rounded-[12px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] p-5 text-[var(--thermal-warning-ink)]"
    >
      <div className="flex items-start gap-3">
        <WarningCircle size={22} weight="bold" className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-3">
          <div>
            <h2 className="text-[1.0625rem] font-bold">{t.errorTitle}</h2>
            <p className="mt-1 text-[0.9375rem] leading-relaxed">{message}</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[var(--thermal-warning-border)] bg-[var(--surface-primary)] px-4 text-[0.875rem] font-semibold text-[var(--thermal-warning-ink)] transition-colors hover:bg-[var(--surface-secondary)]"
            >
              <ArrowsClockwise size={17} aria-hidden="true" />
              {t.retryBtn}
            </button>

            {serviceMode === 'live' && (
              <button
                type="button"
                onClick={onSwitchToMock}
                className="inline-flex min-h-[44px] items-center rounded-[8px] bg-[var(--thermal-warning-ink)] px-4 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t.switchMockBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
