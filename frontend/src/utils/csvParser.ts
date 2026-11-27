import {
  MODEL_FEATURE_ORDER,
  type BatchPredictResponse,
  type ScenarioPreset,
} from '../types/prediction';
import { getThermalMeta } from './thermalScale';

const MAX_CSV_BYTES = 5 * 1024 * 1024;
const MAX_CSV_ROWS = 5000;

export type CsvPrecheckResult =
  | { valid: true; rowCount: number }
  | { valid: false; message: string; missingColumns?: string[] };

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerCsvDownload(filename: string, csvContent: string): void {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Unduh template CSV berisi 21 header eksak model dan 3 baris contoh nyata. */
export function downloadTemplateCsv(presets: ScenarioPreset[]): void {
  const header = ['Date', 'station', ...MODEL_FEATURE_ORDER].map(escapeCsvCell).join(',');
  const rows = presets.map((preset) => {
    const cells = [
      preset.source_date,
      preset.station_id,
      ...MODEL_FEATURE_ORDER.map((key) => preset.features[key]),
    ];
    return cells.map(escapeCsvCell).join(',');
  });
  triggerCsvDownload('template_prediksi_seoul.csv', [header, ...rows].join('\n'));
}

/** Validasi awal struktur CSV di browser sebelum mengirim ke service layer. */
export async function validateCsvFileClient(file: File): Promise<CsvPrecheckResult> {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { valid: false, message: 'Berkas harus berekstensi .csv.' };
  }

  if (file.size === 0) {
    return { valid: false, message: 'File CSV kosong.' };
  }

  if (file.size > MAX_CSV_BYTES) {
    return { valid: false, message: 'Ukuran file melebihi batas maksimal 5 MB.' };
  }

  const text = await file.text();
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  if (lines.length < 2) {
    return { valid: false, message: 'File CSV harus memuat minimal 1 baris header dan 1 baris data.' };
  }

  const rowCount = lines.length - 1;
  if (rowCount > MAX_CSV_ROWS) {
    return {
      valid: false,
      message: `Jumlah baris (${rowCount}) melebihi batas maksimal ${MAX_CSV_ROWS} baris.`,
    };
  }

  const rawHeaders = lines[0]
    .split(',')
    .map((col) => col.trim().replace(/^"|"$/g, ''))
    .map((col) => (col === 'Solar_radiation' ? 'Solar radiation' : col));

  const missingColumns = MODEL_FEATURE_ORDER.filter((col) => !rawHeaders.includes(col));
  if (missingColumns.length > 0) {
    return {
      valid: false,
      message: 'Kolom wajib pada file CSV belum lengkap.',
      missingColumns,
    };
  }

  return { valid: true, rowCount };
}

/** Ekspor hasil prediksi batch menjadi file CSV siap unduh. */
export function downloadBatchResultCsv(result: BatchPredictResponse): void {
  const header = [
    'row_index',
    'row_label',
    'present_tmax_c',
    'predicted_next_tmax_c',
    'delta_t_c',
    'heatwave_status',
    'status_label_id',
    'error',
  ].join(',');

  const lines = result.rows.map((row) => {
    const statusLabel = row.heatwave_status ? getThermalMeta(row.heatwave_status).label : '';
    return [
      row.row_index,
      row.row_label ?? '',
      row.present_tmax,
      row.predicted_tmax,
      row.delta_t,
      row.heatwave_status ?? '',
      statusLabel,
      row.error ?? '',
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  triggerCsvDownload('hasil_prediksi_seoul.csv', [header, ...lines].join('\n'));
}
