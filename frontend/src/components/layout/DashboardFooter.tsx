import { ArrowSquareOut } from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import { UI_STRINGS } from '../../i18n/translations';

interface DashboardFooterProps {
  isSingleMode: boolean;
  locale: Locale;
}

export function DashboardFooter({ isSingleMode, locale }: DashboardFooterProps) {
  const t = UI_STRINGS[locale];

  return (
    <footer
      className={`mt-auto border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 pt-5 min-[720px]:px-6 min-[720px]:py-5 ${
        isSingleMode ? 'pb-24 min-[720px]:pb-5' : 'pb-6'
      }`}
    >
      <div className="mx-auto flex max-w-[1360px] flex-col gap-3 min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between">
        <div className="space-y-0.5 text-[0.8125rem]">
          <p className="font-semibold text-[var(--ink-primary)]">{t.footerProject}</p>
          <p className="text-[var(--ink-secondary)]">{t.footerTagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-[var(--ink-muted)]">
          <span>{t.footerModel}</span>
          <a
            href="https://github.com/Avin1731/K1-PPD-PresiksiSuhu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-tint)]"
          >
            {t.footerRepo}
            <ArrowSquareOut size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
