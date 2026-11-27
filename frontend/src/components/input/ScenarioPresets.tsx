import { CloudRain, SunHorizon, ThermometerHot } from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import { PRESET_TEXT_MAP, UI_STRINGS } from '../../i18n/translations';
import type { ScenarioPreset } from '../../types/prediction';

interface ScenarioPresetsProps {
  presets: ScenarioPreset[];
  activePresetId: ScenarioPreset['id'] | null;
  onSelectPreset: (preset: ScenarioPreset) => void;
  locale: Locale;
}

function PresetGlyph({ id }: { id: ScenarioPreset['id'] }) {
  if (id === 'heatwave') return <ThermometerHot size={18} weight="regular" aria-hidden="true" />;
  if (id === 'rain') return <CloudRain size={18} weight="regular" aria-hidden="true" />;
  return <SunHorizon size={18} weight="regular" aria-hidden="true" />;
}

export function ScenarioPresets({
  presets,
  activePresetId,
  onSelectPreset,
  locale,
}: ScenarioPresetsProps) {
  const t = UI_STRINGS[locale];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[0.875rem] font-semibold text-[var(--ink-primary)]">
          {t.presetsTitle}
        </span>
        <span className="text-[0.8125rem] text-[var(--ink-muted)]">{t.presetsHint}</span>
      </div>

      <div className="grid grid-cols-1 gap-2 min-[720px]:grid-cols-3">
        {presets.map((preset) => {
          const isActive = activePresetId === preset.id;
          const text = PRESET_TEXT_MAP[preset.id]?.[locale] ?? {
            name: preset.name,
            description: preset.description,
          };

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              aria-pressed={isActive}
              title={text.description}
              className={`flex min-h-[46px] items-center gap-2 rounded-[8px] border px-3 py-2 text-left text-[0.8125rem] font-semibold leading-snug transition-colors ${
                isActive
                  ? 'border-[var(--accent-text)] bg-[var(--accent-tint)] text-[var(--accent-text)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--ink-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <span className="shrink-0">
                <PresetGlyph id={preset.id} />
              </span>
              <span>{text.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
