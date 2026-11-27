import {
  ArrowsClockwise,
  CheckCircle,
  Moon,
  Sun,
  Thermometer,
  WarningCircle,
} from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import type { ThemeMode } from '../../hooks/useTheme';
import { UI_STRINGS } from '../../i18n/translations';

interface DashboardHeaderProps {
  serviceMode: 'live' | 'mock';
  onChangeServiceMode: (mode: 'live' | 'mock') => void;
  checkingHealth: boolean;
  healthError: string | null;
  onRefreshHealth: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
}

export function DashboardHeader({
  serviceMode,
  onChangeServiceMode,
  checkingHealth,
  healthError,
  onRefreshHealth,
  theme,
  onToggleTheme,
  locale,
  onChangeLocale,
}: DashboardHeaderProps) {
  const t = UI_STRINGS[locale];

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 min-[720px]:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Thermometer
            size={24}
            weight="duotone"
            className="shrink-0 text-[var(--accent-text)]"
            aria-hidden="true"
          />
          <h1 className="truncate text-[1.1875rem] font-bold leading-tight tracking-tight min-[720px]:text-[1.375rem]">
            {t.headerTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={t.languageGroupLabel}
            className="inline-flex rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-0.5"
          >
            <button
              type="button"
              onClick={() => onChangeLocale('id')}
              aria-pressed={locale === 'id'}
              className={`min-h-[44px] min-w-[44px] rounded-[6px] px-2.5 text-[0.8125rem] font-semibold transition-colors ${
                locale === 'id'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onChangeLocale('en')}
              aria-pressed={locale === 'en'}
              className={`min-h-[44px] min-w-[44px] rounded-[6px] px-2.5 text-[0.8125rem] font-semibold transition-colors ${
                locale === 'en'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
            title={theme === 'dark' ? t.themeToLight : t.themeToDark}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 text-[var(--ink-primary)] transition-colors hover:border-[var(--ink-secondary)]"
          >
            {theme === 'dark' ? (
              <Sun size={18} weight="regular" aria-hidden="true" />
            ) : (
              <Moon size={18} weight="regular" aria-hidden="true" />
            )}
          </button>

          <div
            role="group"
            aria-label={t.serviceGroupLabel}
            className="inline-flex rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-0.5"
          >
            <button
              type="button"
              onClick={() => onChangeServiceMode('live')}
              className={`min-h-[44px] rounded-[6px] px-3 text-[0.8125rem] font-semibold transition-colors ${
                serviceMode === 'live'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {t.serviceLive}
            </button>
            <button
              type="button"
              onClick={() => onChangeServiceMode('mock')}
              className={`min-h-[44px] rounded-[6px] px-3 text-[0.8125rem] font-semibold transition-colors ${
                serviceMode === 'mock'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {t.serviceMock}
            </button>
          </div>

          {checkingHealth ? (
            <span className="inline-flex min-h-[44px] items-center rounded-[6px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 text-[0.8125rem] font-medium text-[var(--ink-secondary)]">
              {t.statusChecking}
            </span>
          ) : healthError ? (
            <button
              type="button"
              onClick={onRefreshHealth}
              title={t.retryHealthTitle}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] px-3 text-[0.8125rem] font-semibold text-[var(--thermal-warning-ink)] transition-colors hover:opacity-90"
            >
              <WarningCircle size={16} weight="bold" aria-hidden="true" />
              {t.statusDisconnected}
              <ArrowsClockwise size={14} aria-hidden="true" />
            </button>
          ) : (
            <span
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border px-3 text-[0.8125rem] font-semibold ${
                serviceMode === 'live'
                  ? 'border-[var(--thermal-normal-border)] bg-[var(--thermal-normal-bg)] text-[var(--thermal-normal-ink)]'
                  : 'border-[var(--thermal-warm-border)] bg-[var(--thermal-warm-bg)] text-[var(--thermal-warm-ink)]'
              }`}
            >
              <CheckCircle size={16} weight="bold" aria-hidden="true" />
              {serviceMode === 'live' ? t.statusConnected : t.statusMock}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
