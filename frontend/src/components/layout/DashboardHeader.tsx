import { ArrowsClockwise, CheckCircle, Thermometer, WarningCircle } from '@phosphor-icons/react';

interface DashboardHeaderProps {
  serviceMode: 'live' | 'mock';
  onChangeServiceMode: (mode: 'live' | 'mock') => void;
  checkingHealth: boolean;
  healthError: string | null;
  onRefreshHealth: () => void;
}

export function DashboardHeader({
  serviceMode,
  onChangeServiceMode,
  checkingHealth,
  healthError,
  onRefreshHealth,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 min-[720px]:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Thermometer
            size={24}
            weight="duotone"
            className="shrink-0 text-[var(--accent-primary)]"
            aria-hidden="true"
          />
          <h1 className="truncate text-[1.1875rem] font-bold leading-tight tracking-tight min-[720px]:text-[1.375rem]">
            Prediksi Suhu &amp; Gelombang Panas Seoul
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Sumber layanan prediksi"
            className="inline-flex rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-0.5"
          >
            <button
              type="button"
              onClick={() => onChangeServiceMode('live')}
              className={`min-h-[44px] rounded-[6px] px-3 text-[0.8125rem] font-semibold transition-colors ${
                serviceMode === 'live'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-primary)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              API Flask
            </button>
            <button
              type="button"
              onClick={() => onChangeServiceMode('mock')}
              className={`min-h-[44px] rounded-[6px] px-3 text-[0.8125rem] font-semibold transition-colors ${
                serviceMode === 'mock'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-primary)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              Simulasi FE
            </button>
          </div>

          {checkingHealth ? (
            <span className="inline-flex min-h-[44px] items-center rounded-[6px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 text-[0.8125rem] font-medium text-[var(--ink-secondary)]">
              Memeriksa koneksi...
            </span>
          ) : healthError ? (
            <button
              type="button"
              onClick={onRefreshHealth}
              title="Klik untuk memeriksa ulang koneksi server backend"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] px-3 text-[0.8125rem] font-semibold text-[var(--thermal-warning-ink)] transition-colors hover:opacity-90"
            >
              <WarningCircle size={16} weight="bold" aria-hidden="true" />
              API Tidak Terhubung
              <ArrowsClockwise size={14} aria-hidden="true" />
            </button>
          ) : (
            <span
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border px-3 text-[0.8125rem] font-semibold ${
                serviceMode === 'live'
                  ? 'border-[var(--thermal-normal-border)] bg-[var(--thermal-normal-bg)] text-[var(--thermal-normal-ink)]'
                  : 'border-[var(--thermal-warm-border)] bg-[var(--thermal-warm-bg)] text-[var(--thermal-warm-ink)]'
              }`}
            >
              <CheckCircle size={16} weight="bold" aria-hidden="true" />
              {serviceMode === 'live' ? 'API Terhubung' : 'Mode Simulasi FE'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
