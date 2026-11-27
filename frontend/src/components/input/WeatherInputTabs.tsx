import { useRef } from 'react';
import { FEATURE_META_LIST, INPUT_TABS } from '../../data/featureMeta';
import type { Locale } from '../../hooks/useLanguage';
import {
  FEATURE_EN_MAP,
  SUBGROUP_EN_MAP,
  TAB_TEXT_MAP,
  UI_STRINGS,
} from '../../i18n/translations';
import type { FeatureKey, InputTabId } from '../../types/prediction';
import type { FeatureFormDraft, FeatureValidationErrors } from '../../utils/validation';
import { countErrorsByTab } from '../../utils/validation';

interface WeatherInputTabsProps {
  activeTab: InputTabId;
  onChangeTab: (tab: InputTabId) => void;
  draft: FeatureFormDraft;
  errors: FeatureValidationErrors;
  warnings: FeatureValidationErrors;
  onChangeField: (key: FeatureKey, value: string) => void;
  locale: Locale;
}

export function WeatherInputTabs({
  activeTab,
  onChangeTab,
  draft,
  errors,
  warnings,
  onChangeField,
  locale,
}: WeatherInputTabsProps) {
  const t = UI_STRINGS[locale];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabErrors = countErrorsByTab(errors);
  const currentFields = FEATURE_META_LIST.filter((item) => item.tab === activeTab);

  const subgroups: Array<{ title: string; fields: typeof currentFields }> = [];
  for (const field of currentFields) {
    const subgroupTitle =
      locale === 'en' ? (SUBGROUP_EN_MAP[field.subgroup] ?? field.subgroup) : field.subgroup;
    const existing = subgroups.find((group) => group.title === subgroupTitle);
    if (existing) {
      existing.fields.push(field);
    } else {
      subgroups.push({ title: subgroupTitle, fields: [field] });
    }
  }

  function handleTabKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % INPUT_TABS.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + INPUT_TABS.length) % INPUT_TABS.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = INPUT_TABS.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      onChangeTab(INPUT_TABS[nextIdx].id);
      tabRefs.current[nextIdx]?.focus();
    }
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={t.tabsGroupLabel}
        className="grid grid-cols-3 gap-1 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-1"
      >
        {INPUT_TABS.map((tab, idx) => {
          const isSelected = activeTab === tab.id;
          const errCount = tabErrors[tab.id];
          const tabText = TAB_TEXT_MAP[tab.id][locale];

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChangeTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-[6px] px-2 py-2 text-center text-[0.8125rem] font-semibold transition-colors min-[720px]:px-3 min-[720px]:text-[0.875rem] ${
                isSelected
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              <span className="min-[720px]:hidden">{tabText.shortLabel}</span>
              <span className="hidden min-[720px]:inline">{tabText.label}</span>
              {errCount > 0 && (
                <span
                  aria-label={t.tabErrorLabel(errCount)}
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--thermal-warning-bg)] px-1.5 text-[0.75rem] font-bold text-[var(--thermal-warning-ink)] tabular-nums"
                >
                  {errCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="space-y-5"
      >
        {subgroups.map((group) => (
          <fieldset key={group.title} className="space-y-3">
            <legend className="text-[0.8125rem] font-semibold text-[var(--ink-secondary)]">
              {group.title}
            </legend>
            <div className="grid grid-cols-1 gap-3 min-[720px]:grid-cols-2">
              {group.fields.map((meta) => {
                const fieldError = errors[meta.key];
                const fieldWarning = warnings[meta.key];
                const inputId = `field-${meta.key.replace(/\s+/g, '-')}`;
                const msgId = `${inputId}-msg`;
                const label = locale === 'en' ? FEATURE_EN_MAP[meta.key].label : meta.label;
                const desc =
                  locale === 'en' ? FEATURE_EN_MAP[meta.key].description : meta.description;

                return (
                  <div key={meta.key} className="min-w-0 space-y-1">
                    <label
                      htmlFor={inputId}
                      className="block truncate text-[0.8125rem] font-semibold text-[var(--ink-primary)]"
                      title={desc}
                    >
                      {label}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id={inputId}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        value={draft[meta.key] ?? ''}
                        onChange={(e) => onChangeField(meta.key, e.target.value)}
                        aria-invalid={Boolean(fieldError)}
                        aria-describedby={fieldError || fieldWarning ? msgId : undefined}
                        className={`min-h-[44px] w-full rounded-[8px] border bg-[var(--surface-primary)] py-2 pl-3 pr-16 text-[0.9375rem] font-medium text-[var(--ink-primary)] tabular-nums transition-colors ${
                          fieldError
                            ? 'border-[var(--thermal-warning-gauge)] bg-[var(--thermal-warning-bg)]/30'
                            : 'border-[var(--border-subtle)] hover:border-[var(--ink-secondary)]'
                        }`}
                      />
                      <span className="pointer-events-none absolute right-2.5 rounded-[6px] bg-[var(--surface-secondary)] px-2 py-0.5 text-[0.75rem] font-semibold text-[var(--ink-muted)]">
                        {meta.unit}
                      </span>
                    </div>
                    {fieldError ? (
                      <p
                        id={msgId}
                        className="text-[0.75rem] font-medium text-[var(--thermal-warning-ink)]"
                      >
                        {fieldError}
                      </p>
                    ) : fieldWarning ? (
                      <p
                        id={msgId}
                        className="text-[0.75rem] font-medium text-[var(--thermal-warm-ink)] tabular-nums"
                      >
                        {fieldWarning}
                      </p>
                    ) : (
                      <p className="text-[0.75rem] text-[var(--ink-muted)] tabular-nums">
                        {t.trainRangeLabel}: {meta.min} - {meta.max} {meta.unit}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
