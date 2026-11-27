import { ArrowSquareOut } from '@phosphor-icons/react';

interface DashboardFooterProps {
  isSingleMode: boolean;
}

export function DashboardFooter({ isSingleMode }: DashboardFooterProps) {
  return (
    <footer
      className={`mt-auto border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 pt-5 min-[720px]:px-6 min-[720px]:py-5 ${
        isSingleMode ? 'pb-24 min-[720px]:pb-5' : 'pb-6'
      }`}
    >
      <div className="mx-auto flex max-w-[1360px] flex-col gap-3 min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between">
        <div className="space-y-0.5 text-[0.8125rem]">
          <p className="font-semibold text-[var(--ink-primary)]">
            Proyek UAS Praktikum Penambangan Data, D4 Rekayasa Perangkat Lunak SV UGM | Kelompok 1
          </p>
          <p className="text-[var(--ink-secondary)]">
            Sistem pendukung keputusan prakiraan suhu harian dan mitigasi gelombang panas Kota Seoul.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-[var(--ink-muted)]">
          <span>RandomForestRegressor (rf_model.joblib) | Dataset UCI Seoul Temperature / LDAPS</span>
          <a
            href="https://github.com/Avin1731/K1-PPD-PresiksiSuhu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-tint)]"
          >
            Repositori GitHub
            <ArrowSquareOut size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
