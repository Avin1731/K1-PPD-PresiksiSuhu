import { CloudRain, SunHorizon, ThermometerHot } from '@phosphor-icons/react';
import type { ScenarioPreset } from '../../types/prediction';

interface ScenarioPresetsProps {
  presets: ScenarioPreset[];
  activePresetId: ScenarioPreset['id'] | null;
  onSelectPreset: (preset: ScenarioPreset) => void;
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
}: ScenarioPresetsProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[0.875rem] font-semibold text-[var(--ink-primary)]">
          Skenario Cepat (Data Asli Dataset UTS)
        </span>
        <span className="text-[0.8125rem] text-[var(--ink-muted)]">
          Isi 21 parameter dalam 1 klik
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 min-[720px]:grid-cols-3">
        {presets.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              aria-pressed={isActive}
              title={preset.description}
              className={`flex min-h-[46px] items-center gap-2 rounded-[8px] border px-3 py-2 text-left text-[0.8125rem] font-semibold leading-snug transition-colors ${
                isActive
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-tint)] text-[var(--accent-primary)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--ink-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <span className="shrink-0">
                <PresetGlyph id={preset.id} />
              </span>
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
