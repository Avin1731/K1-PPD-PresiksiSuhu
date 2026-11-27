import { MapPin } from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import { UI_STRINGS } from '../../i18n/translations';
import type { StationPreset } from '../../types/prediction';

interface StationSelectorProps {
  stations: StationPreset[];
  selectedStationId: number;
  isManualGeoOverride: boolean;
  onSelectStation: (station: StationPreset) => void;
  locale: Locale;
}

export function StationSelector({
  stations,
  selectedStationId,
  isManualGeoOverride,
  onSelectStation,
  locale,
}: StationSelectorProps) {
  const t = UI_STRINGS[locale];
  const activeStation =
    stations.find((item) => item.station_id === selectedStationId) ?? stations[0];

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="station-selector"
          className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-[var(--ink-primary)]"
        >
          <MapPin size={16} className="text-[var(--accent-text)]" aria-hidden="true" />
          {t.stationLabel}
        </label>
        {isManualGeoOverride && (
          <span className="rounded-[6px] border border-[var(--thermal-warm-border)] bg-[var(--thermal-warm-bg)] px-2 py-0.5 text-[0.75rem] font-semibold text-[var(--thermal-warm-ink)]">
            {t.stationManualTag}
          </span>
        )}
      </div>

      <select
        id="station-selector"
        value={selectedStationId}
        onChange={(e) => {
          const id = Number(e.target.value);
          const match = stations.find((item) => item.station_id === id);
          if (match) onSelectStation(match);
        }}
        className="min-h-[44px] w-full rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-[0.9375rem] font-medium text-[var(--ink-primary)] transition-colors hover:border-[var(--ink-secondary)]"
      >
        {stations.map((station) => (
          <option key={station.station_id} value={station.station_id}>
            {t.stationPrefix} {station.station_id} ({station.lat.toFixed(4)}°N, {station.lon.toFixed(4)}°E | DEM {station.DEM.toFixed(1)} m)
          </option>
        ))}
      </select>

      {activeStation && (
        <p className="text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
          {t.stationAutoFillPrefix}: lat {activeStation.lat.toFixed(4)}, lon {activeStation.lon.toFixed(4)}, DEM{' '}
          {activeStation.DEM.toFixed(1)} m, Slope {activeStation.Slope.toFixed(4)}
        </p>
      )}
    </div>
  );
}
