import { ArrowCounterClockwise, ClockCounterClockwise, Trash } from '@phosphor-icons/react';
import type { SessionHistoryItem } from '../../types/prediction';
import { getThermalMeta } from '../../utils/thermalScale';

interface SessionHistoryTableProps {
  history: SessionHistoryItem[];
  onLoadHistory: (item: SessionHistoryItem) => void;
  onClearHistory: () => void;
}

export function SessionHistoryTable({
  history,
  onLoadHistory,
  onClearHistory,
}: SessionHistoryTableProps) {
  return (
    <section
      aria-labelledby="session-history-heading"
      className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise
            size={20}
            className="text-[var(--accent-text)]"
            aria-hidden="true"
          />
          <div>
            <h2
              id="session-history-heading"
              className="text-[1.0625rem] font-semibold text-[var(--ink-primary)]"
            >
              Riwayat Prediksi Sesi (5 Terakhir)
            </h2>
            <p className="text-[0.8125rem] text-[var(--ink-secondary)]">
              Bandingkan beberapa skenario percobaan atau muat ulang parameternya ke formulir.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3.5 text-[0.8125rem] font-semibold text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
          >
            <Trash size={16} aria-hidden="true" />
            Hapus Riwayat
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="mt-4 rounded-[8px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-5 text-center">
          <p className="text-[0.9375rem] font-semibold text-[var(--ink-primary)]">
            Belum ada riwayat prediksi pada sesi ini
          </p>
          <p className="mt-1 text-[0.8125rem] text-[var(--ink-secondary)]">
            Jalankan prediksi pertama di formulir atas untuk mencatat dan membandingkan hasilnya di sini.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div className="mt-4 hidden overflow-x-auto min-[720px]:block">
            <table className="w-full border-collapse text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[0.8125rem] font-semibold text-[var(--ink-secondary)]">
                  <th className="py-2.5 pr-3">Status</th>
                  <th className="py-2.5 pr-3">Stasiun</th>
                  <th className="py-2.5 pr-3 text-right">Next_Tmax</th>
                  <th className="py-2.5 pr-3 text-right">Present_Tmax</th>
                  <th className="py-2.5 pr-3 text-right">Delta T</th>
                  <th className="py-2.5 pr-3">Waktu &amp; Sumber</th>
                  <th className="py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {history.map((item) => {
                  const meta = getThermalMeta(item.heatwave_status);
                  const sign = item.delta_t >= 0 ? '+' : '';
                  return (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-3">
                        <span
                          style={{
                            backgroundColor: meta.bg,
                            borderColor: meta.border,
                            color: meta.ink,
                          }}
                          className="inline-block rounded-[6px] border px-2 py-0.5 text-[0.75rem] font-semibold"
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-[var(--ink-primary)]">
                        {item.station_label}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-bold tabular-nums">
                        {item.predicted_tmax.toFixed(2)} °C
                      </td>
                      <td className="py-2.5 pr-3 text-right text-[var(--ink-secondary)] tabular-nums">
                        {item.present_tmax.toFixed(1)} °C
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {sign}
                        {item.delta_t.toFixed(2)} °C
                      </td>
                      <td className="py-2.5 pr-3 text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
                        {item.timestamp} | {item.is_mock ? 'Simulasi FE' : 'API Live'}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => onLoadHistory(item)}
                          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-[0.8125rem] font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-tint)]"
                        >
                          <ArrowCounterClockwise size={15} aria-hidden="true" />
                          Muat Ulang Input
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Row Cards (< 720px) */}
          <div className="mt-4 space-y-3 min-[720px]:hidden">
            {history.map((item) => {
              const meta = getThermalMeta(item.heatwave_status);
              const sign = item.delta_t >= 0 ? '+' : '';
              return (
                <div
                  key={item.id}
                  className="space-y-2.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[0.875rem] font-semibold text-[var(--ink-primary)]">
                      {item.station_label}
                    </span>
                    <span
                      style={{
                        backgroundColor: meta.bg,
                        borderColor: meta.border,
                        color: meta.ink,
                      }}
                      className="rounded-[6px] border px-2 py-0.5 text-[0.75rem] font-semibold"
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] tabular-nums">
                    <span className="font-bold text-[var(--ink-primary)]">
                      Next_Tmax: {item.predicted_tmax.toFixed(2)} °C
                    </span>
                    <span className="text-[var(--ink-secondary)]">
                      Hari Ini: {item.present_tmax.toFixed(1)} °C
                    </span>
                    <span className="text-[var(--ink-secondary)]">
                      Delta: {sign}
                      {item.delta_t.toFixed(2)} °C
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2">
                    <span className="text-[0.75rem] text-[var(--ink-muted)] tabular-nums">
                      {item.timestamp} | {item.is_mock ? 'Simulasi FE' : 'API Live'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onLoadHistory(item)}
                      className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-[0.8125rem] font-semibold text-[var(--accent-text)] hover:bg-[var(--accent-tint)]"
                    >
                      <ArrowCounterClockwise size={15} aria-hidden="true" />
                      Muat Ulang Input
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
