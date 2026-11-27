import { CheckCircle, Info, Snowflake, Warning, WarningOctagon } from '@phosphor-icons/react';
import type { Locale } from '../../hooks/useLanguage';
import type { ThermalLevel } from '../../types/prediction';
import { getThermalMeta } from '../../utils/thermalScale';

interface HeatwaveBannerProps {
  level: ThermalLevel;
  locale: Locale;
}

function ThermalStatusIcon({ level }: { level: ThermalLevel }) {
  if (level === 'cool') return <Snowflake size={22} weight="bold" aria-hidden="true" />;
  if (level === 'normal') return <CheckCircle size={22} weight="bold" aria-hidden="true" />;
  if (level === 'warm') return <Info size={22} weight="bold" aria-hidden="true" />;
  if (level === 'advisory') return <Warning size={22} weight="bold" aria-hidden="true" />;
  return <WarningOctagon size={22} weight="bold" aria-hidden="true" />;
}

export function HeatwaveBanner({ level, locale }: HeatwaveBannerProps) {
  const meta = getThermalMeta(level, locale);

  return (
    <section
      aria-label={meta.bannerTitle}
      style={{
        backgroundColor: meta.bg,
        borderColor: meta.border,
        color: meta.ink,
      }}
      className="flex items-start gap-3 rounded-[12px] border p-4"
    >
      <span className="mt-0.5 shrink-0">
        <ThermalStatusIcon level={level} />
      </span>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[1rem] font-bold leading-snug">{meta.bannerTitle}</h2>
          <span className="text-[0.8125rem] font-semibold tabular-nums">
            ({meta.rangeLabel})
          </span>
        </div>
        <p className="text-[0.9375rem] leading-relaxed">{meta.bannerDescription}</p>
      </div>
    </section>
  );
}
