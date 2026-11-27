import type { ThermalLevel } from '../../types/prediction';
import { getThermalMeta } from '../../utils/thermalScale';

interface ThermalGaugeProps {
  temperature: number;
  level: ThermalLevel;
}

const MIN_TEMP = 15;
const MAX_TEMP = 40;
const CX = 130;
const CY = 126;
const RADIUS = 82;

const GAUGE_SEGMENTS: Array<{ from: number; to: number; color: string }> = [
  { from: 15, to: 25, color: 'var(--thermal-cool-gauge)' },
  { from: 25, to: 30, color: 'var(--thermal-normal-gauge)' },
  { from: 30, to: 33, color: 'var(--thermal-warm-gauge)' },
  { from: 33, to: 35, color: 'var(--thermal-advisory-gauge)' },
  { from: 35, to: 40, color: 'var(--thermal-warning-gauge)' },
];

const GAUGE_TICKS = [15, 25, 30, 33, 35, 40];

function tempToTheta(temp: number): number {
  const clamped = Math.max(MIN_TEMP, Math.min(MAX_TEMP, temp));
  const frac = (clamped - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  return -Math.PI + frac * Math.PI;
}

function polarToCartesian(r: number, theta: number): { x: number; y: number } {
  return {
    x: CX + r * Math.cos(theta),
    y: CY + r * Math.sin(theta),
  };
}

function buildArcPath(fromTemp: number, toTemp: number): string {
  const start = polarToCartesian(RADIUS, tempToTheta(fromTemp));
  const end = polarToCartesian(RADIUS, tempToTheta(toTemp));
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function ThermalGauge({ temperature, level }: ThermalGaugeProps) {
  const meta = getThermalMeta(level);
  const clamped = Math.max(MIN_TEMP, Math.min(MAX_TEMP, temperature));
  const frac = (clamped - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  const needleDegrees = -90 + frac * 180;

  return (
    <section
      aria-label="Pengukur skala termal terkalibrasi"
      className="flex flex-col justify-between rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[0.875rem] font-semibold text-[var(--ink-secondary)]">
          Skala Termal Terkalibrasi
        </h2>
        <span className="text-[0.8125rem] font-medium text-[var(--ink-muted)] tabular-nums">
          15 - 40 °C
        </span>
      </div>

      <div className="my-2 flex justify-center">
        <svg
          viewBox="0 0 260 152"
          className="w-full max-w-[260px]"
          role="img"
          aria-label={`Skala termal menunjukkan ${temperature.toFixed(1)} derajat Celsius, status ${meta.label}`}
        >
          {/* Track latar netral tipis */}
          <path
            d={buildArcPath(MIN_TEMP, MAX_TEMP)}
            fill="none"
            stroke="var(--surface-secondary)"
            strokeWidth={18}
            strokeLinecap="butt"
          />

          {/* 5 Zona warna semantik sinkron F-UI-07 & F-UI-08 */}
          {GAUGE_SEGMENTS.map((seg) => (
            <path
              key={`${seg.from}-${seg.to}`}
              d={buildArcPath(seg.from, seg.to)}
              fill="none"
              stroke={seg.color}
              strokeWidth={16}
              strokeLinecap="butt"
            />
          ))}

          {/* Garis tanda batas terkalibrasi */}
          {GAUGE_TICKS.map((tick) => {
            const theta = tempToTheta(tick);
            const inner = polarToCartesian(RADIUS + 9, theta);
            const outer = polarToCartesian(RADIUS + 14, theta);
            const labelPos = polarToCartesian(RADIUS + 25, theta);
            return (
              <g key={tick}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="var(--ink-muted)"
                  strokeWidth={1.25}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--ink-secondary)"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Jarum penunjuk dinamis (MOTION 1: 200ms ease-out state transition) */}
          <g
            style={{
              transform: `rotate(${needleDegrees.toFixed(2)}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
              transition: 'transform 200ms ease-out',
            }}
          >
            <line
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY - (RADIUS - 14)}
              stroke="var(--ink-primary)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>

          <circle cx={CX} cy={CY} r={6.5} fill="var(--ink-primary)" />
          <circle cx={CX} cy={CY} r={2.5} fill="var(--surface-primary)" />
        </svg>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-[0.8125rem] tabular-nums">
        <span className="text-[var(--ink-secondary)]">Posisi saat ini</span>
        <span style={{ color: meta.ink }} className="font-semibold">
          {temperature.toFixed(1)} °C ({meta.rangeLabel})
        </span>
      </div>
    </section>
  );
}
