import { FileCsv, SlidersHorizontal } from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import { UI_STRINGS } from '../../i18n/translations';

export type WorkspaceMode = 'single' | 'batch';

interface ModeSwitcherProps {
  mode: WorkspaceMode;
  onChangeMode: (mode: WorkspaceMode) => void;
  locale: Locale;
}

export function ModeSwitcher({ mode, onChangeMode, locale }: ModeSwitcherProps) {
  const t = UI_STRINGS[locale];

  return (
    <div
      role="group"
      aria-label={t.modeGroupLabel}
      className="grid w-full grid-cols-2 gap-1 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-1 min-[720px]:inline-grid min-[720px]:w-auto"
    >
      <button
        type="button"
        onClick={() => onChangeMode('single')}
        aria-pressed={mode === 'single'}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[6px] px-4 text-[0.875rem] font-semibold transition-colors ${
          mode === 'single'
            ? 'bg-[var(--surface-primary)] text-[var(--accent-text)] shadow-xs'
            : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
        }`}
      >
        <SlidersHorizontal size={17} aria-hidden="true" />
        {t.modeSingle}
      </button>
      <button
        type="button"
        onClick={() => onChangeMode('batch')}
        aria-pressed={mode === 'batch'}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[6px] px-4 text-[0.875rem] font-semibold transition-colors ${
          mode === 'batch'
            ? 'bg-[var(--surface-primary)] text-[var(--accent-text)] shadow-xs'
            : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
        }`}
      >
        <FileCsv size={17} aria-hidden="true" />
        {t.modeBatch}
      </button>
    </div>
  );
}
