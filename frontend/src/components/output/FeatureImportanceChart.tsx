import { FEATURE_META_MAP } from '../../data/featureMeta';
import type { FeatureImportanceItem, WeatherFeatures } from '../../types/prediction';

interface FeatureImportanceChartProps {
  factors: FeatureImportanceItem[];
  inputFeatures: WeatherFeatures;
}

function formatInputValue(value: number): string {
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 10) return value.toFixed(2);
  return value.toFixed(3);
}

export function FeatureImportanceChart({
  factors,
  inputFeatures,
}: FeatureImportanceChartProps) {
  const topFactors = factors.slice(0, 7);
  const maxImportance = Math.max(...topFactors.map((item) => item.importance), 0.01);

  return (
    <section
      aria-labelledby="xai-chart-heading"
      className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <h2 id="xai-chart-heading" className="text-[1rem] font-semibold text-[var(--ink-primary)]">
            Variabel apa yang paling memengaruhi prediksi model?
          </h2>
          <p className="mt-0.5 text-[0.8125rem] text-[var(--ink-secondary)]">
            Bobot kontribusi global 7 fitur teratas pada Random Forest (rf_model.joblib) beserta nilai input yang Anda masukkan.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {topFactors.map((item, idx) => {
          const meta = FEATURE_META_MAP[item.feature];
          const pct = item.importance * 100;
          const barWidth = Math.max(4, Math.round((item.importance / maxImportance) * 100));
          const activeVal =
            typeof item.value === 'number' ? item.value : inputFeatures[item.feature];
          const isTopDriver = idx === 0;

          return (
            <div key={item.feature} className="space-y-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-[0.8125rem]">
                <div className="min-w-0">
                  <span className="font-semibold text-[var(--ink-primary)]">
                    {meta ? meta.label : item.feature}
                  </span>{' '}
                  <span className="text-[var(--ink-muted)]">({item.feature})</span>
                </div>

                <div className="flex items-baseline gap-3 tabular-nums">
                  <span className="text-[var(--ink-secondary)]">
                    Input: {formatInputValue(activeVal)} {meta?.unit ?? ''}
                  </span>
                  <span
                    className={`min-w-[48px] text-right font-bold ${
                      isTopDriver ? 'text-[var(--accent-primary)]' : 'text-[var(--ink-primary)]'
                    }`}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-[4px] bg-[var(--surface-secondary)]">
                <div
                  className="h-full rounded-[4px] transition-all duration-200"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: isTopDriver ? 'var(--accent-primary)' : '#64748B',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
