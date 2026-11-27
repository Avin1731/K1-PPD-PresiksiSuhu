import { useRef, useState } from 'react';
import {
  DownloadSimple,
  FileCsv,
  Trash,
  UploadSimple,
  WarningCircle,
} from '@phosphor-icons/react';
import type { BatchPredictResponse, ScenarioPreset } from '../../types/prediction';
import { downloadBatchResultCsv, downloadTemplateCsv } from '../../utils/csvParser';
import { getThermalMeta } from '../../utils/thermalScale';

interface BatchCsvPanelProps {
  presets: ScenarioPreset[];
  loading: boolean;
  error: string | null;
  missingColumns: string[];
  result: BatchPredictResponse | null;
  onUploadFile: (file: File) => void;
  onClear: () => void;
}

export function BatchCsvPanel({
  presets,
  loading,
  error,
  missingColumns,
  result,
  onUploadFile,
  onClear,
}: BatchCsvPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setSelectedFileName(file.name);
    onUploadFile(file);
  }

  return (
    <div className="space-y-5">
      <section
        aria-label="Unggah file CSV prediksi batch"
        className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-[1.0625rem] font-semibold text-[var(--ink-primary)]">
              Prediksi Massal Multi-Hari (Batch CSV)
            </h2>
            <p className="mt-1 max-w-[68ch] text-[0.875rem] text-[var(--ink-secondary)]">
              Unggah berkas .csv (maksimal 5 MB atau 5.000 baris) yang memuat 21 kolom fitur model eksak termasuk Slope dan Solar radiation (Wh/m2).
            </p>
          </div>

          <button
            type="button"
            onClick={() => downloadTemplateCsv(presets)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 text-[0.875rem] font-semibold text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
          >
            <DownloadSimple size={17} aria-hidden="true" />
            Unduh Template CSV
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-label="Pilih berkas CSV"
          onChange={(e) => {
            handleFileSelected(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <div
          role="button"
          tabIndex={0}
          aria-label="Area unggah CSV. Tekan Enter atau Space untuk memilih file, atau seret file ke sini."
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelected(e.dataTransfer.files?.[0]);
          }}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed px-4 py-8 text-center transition-colors ${
            isDragging
              ? 'border-[var(--accent-primary)] bg-[var(--accent-tint)]'
              : 'border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:border-[var(--ink-secondary)]'
          }`}
        >
          <UploadSimple
            size={28}
            weight="duotone"
            className="text-[var(--accent-primary)]"
            aria-hidden="true"
          />
          <p className="mt-2 text-[0.9375rem] font-semibold text-[var(--ink-primary)]">
            {selectedFileName ? `Berkas dipilih: ${selectedFileName}` : 'Seret file .csv ke area ini atau klik untuk memilih'}
          </p>
          <p className="mt-1 text-[0.8125rem] text-[var(--ink-muted)]">
            Format UTF-8 dengan 21 fitur model. Kolom opsional Date dan station akan dipakai sebagai label baris.
          </p>
        </div>
      </section>

      {loading && (
        <section
          aria-busy="true"
          aria-live="polite"
          className="space-y-3 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
        >
          <p className="text-[0.875rem] font-semibold text-[var(--ink-secondary)]">
            Memproses baris CSV...
          </p>
          <div className="h-16 animate-pulse rounded-[8px] bg-[var(--surface-secondary)]" />
          <div className="h-32 animate-pulse rounded-[8px] bg-[var(--surface-secondary)]" />
        </section>
      )}

      {error && (
        <section
          role="alert"
          className="rounded-[12px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] p-5 text-[var(--thermal-warning-ink)]"
        >
          <div className="flex items-start gap-3">
            <WarningCircle size={22} weight="bold" className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 space-y-2">
              <h3 className="text-[1rem] font-bold">Gagal Memproses Berkas CSV</h3>
              <p className="text-[0.9375rem]">{error}</p>
              {missingColumns.length > 0 && (
                <div>
                  <p className="text-[0.8125rem] font-semibold">Kolom yang hilang:</p>
                  <p className="mt-1 text-[0.8125rem]">{missingColumns.join(', ')}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedFileName(null);
                  onClear();
                }}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[var(--thermal-warning-border)] bg-[var(--surface-primary)] px-4 text-[0.875rem] font-semibold text-[var(--thermal-warning-ink)] hover:bg-[var(--surface-secondary)]"
              >
                Bersihkan Error
              </button>
            </div>
          </div>
        </section>
      )}

      {result && !loading && (
        <section
          aria-label="Hasil prediksi batch CSV"
          className="space-y-4 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2">
              <FileCsv size={20} className="text-[var(--accent-primary)]" aria-hidden="true" />
              <div>
                <h3 className="text-[1.0625rem] font-semibold text-[var(--ink-primary)]">
                  Ringkasan Hasil Batch
                </h3>
                <p className="text-[0.8125rem] text-[var(--ink-muted)] tabular-nums">
                  {result.is_mock ? 'Estimasi Simulasi FE' : 'API Live rf_model.joblib'} |{' '}
                  {result.inference_ms.toFixed(2)} ms
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadBatchResultCsv(result)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] bg-[var(--accent-primary)] px-4 text-[0.875rem] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                <DownloadSimple size={17} aria-hidden="true" />
                Unduh Hasil CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFileName(null);
                  onClear();
                }}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 text-[0.875rem] font-semibold text-[var(--ink-primary)] hover:bg-[var(--surface-secondary)]"
              >
                <Trash size={16} aria-hidden="true" />
                Bersihkan Hasil
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 min-[720px]:grid-cols-5">
            <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
              <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">Diproses / Gagal</dt>
              <dd className="mt-0.5 text-[1rem] font-bold text-[var(--ink-primary)] tabular-nums">
                {result.processed_rows} / {result.failed_rows}
              </dd>
            </div>
            <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
              <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">Suhu Minimum</dt>
              <dd className="mt-0.5 text-[1rem] font-bold text-[var(--ink-primary)] tabular-nums">
                {result.summary.min_tmax !== null ? `${result.summary.min_tmax.toFixed(2)} °C` : '-'}
              </dd>
            </div>
            <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
              <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">Rata-rata Suhu</dt>
              <dd className="mt-0.5 text-[1rem] font-bold text-[var(--ink-primary)] tabular-nums">
                {result.summary.avg_tmax !== null ? `${result.summary.avg_tmax.toFixed(2)} °C` : '-'}
              </dd>
            </div>
            <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
              <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">Suhu Maksimum</dt>
              <dd className="mt-0.5 text-[1rem] font-bold text-[var(--ink-primary)] tabular-nums">
                {result.summary.max_tmax !== null ? `${result.summary.max_tmax.toFixed(2)} °C` : '-'}
              </dd>
            </div>
            <div className="col-span-2 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3 min-[720px]:col-span-1">
              <dt className="text-[0.75rem] font-medium text-[var(--ink-muted)]">Siaga / Bahaya</dt>
              <dd className="mt-0.5 text-[1rem] font-bold text-[var(--ink-primary)] tabular-nums">
                {result.summary.advisory_count} / {result.summary.warning_count}
              </dd>
            </div>
          </dl>

          {/* Desktop & Tablet Table */}
          <div className="hidden overflow-x-auto min-[720px]:block">
            <table className="w-full border-collapse text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[0.8125rem] font-semibold text-[var(--ink-secondary)]">
                  <th className="py-2.5 pr-3">Baris</th>
                  <th className="py-2.5 pr-3">Status Termal</th>
                  <th className="py-2.5 pr-3 text-right">Next_Tmax</th>
                  <th className="py-2.5 pr-3 text-right">Present_Tmax</th>
                  <th className="py-2.5 pr-3 text-right">Delta T</th>
                  <th className="py-2.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {result.rows.map((row) => {
                  const meta = row.heatwave_status ? getThermalMeta(row.heatwave_status) : null;
                  const deltaSign = row.delta_t !== null && row.delta_t >= 0 ? '+' : '';
                  return (
                    <tr key={row.row_index}>
                      <td className="py-2.5 pr-3 font-medium text-[var(--ink-primary)] tabular-nums">
                        #{row.row_index} {row.row_label ? `(${row.row_label})` : ''}
                      </td>
                      <td className="py-2.5 pr-3">
                        {meta ? (
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
                        ) : (
                          <span className="inline-block rounded-[6px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] px-2 py-0.5 text-[0.75rem] font-semibold text-[var(--thermal-warning-ink)]">
                            Baris Gagal
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-bold tabular-nums">
                        {row.predicted_tmax !== null ? `${row.predicted_tmax.toFixed(2)} °C` : '-'}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-[var(--ink-secondary)] tabular-nums">
                        {row.present_tmax !== null ? `${row.present_tmax.toFixed(1)} °C` : '-'}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {row.delta_t !== null ? `${deltaSign}${row.delta_t.toFixed(2)} °C` : '-'}
                      </td>
                      <td className="py-2.5 text-[0.8125rem] text-[var(--thermal-warning-ink)]">
                        {row.error ?? 'Valid'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Row Cards (< 720px) */}
          <div className="space-y-2.5 min-[720px]:hidden">
            {result.rows.map((row) => {
              const meta = row.heatwave_status ? getThermalMeta(row.heatwave_status) : null;
              const deltaSign = row.delta_t !== null && row.delta_t >= 0 ? '+' : '';
              return (
                <div
                  key={row.row_index}
                  className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[0.875rem] font-semibold text-[var(--ink-primary)] tabular-nums">
                      #{row.row_index} {row.row_label ?? ''}
                    </span>
                    {meta ? (
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
                    ) : (
                      <span className="rounded-[6px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] px-2 py-0.5 text-[0.75rem] font-semibold text-[var(--thermal-warning-ink)]">
                        Baris Gagal
                      </span>
                    )}
                  </div>

                  {row.error ? (
                    <p className="mt-2 text-[0.8125rem] text-[var(--thermal-warning-ink)]">
                      {row.error}
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] tabular-nums">
                      <span className="font-bold text-[var(--ink-primary)]">
                        Next_Tmax: {row.predicted_tmax?.toFixed(2)} °C
                      </span>
                      <span className="text-[var(--ink-secondary)]">
                        Hari Ini: {row.present_tmax?.toFixed(1)} °C
                      </span>
                      <span className="text-[var(--ink-secondary)]">
                        Delta: {deltaSign}
                        {row.delta_t?.toFixed(2)} °C
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
