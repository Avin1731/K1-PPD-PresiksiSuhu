import { ArrowsClockwise, WarningCircle } from '@phosphor-icons/react';

interface ResultErrorStateProps {
  message: string;
  serviceMode: 'live' | 'mock';
  onRetry: () => void;
  onSwitchToMock: () => void;
}

export function ResultErrorState({
  message,
  serviceMode,
  onRetry,
  onSwitchToMock,
}: ResultErrorStateProps) {
  return (
    <section
      role="alert"
      aria-label="Kesalahan prediksi"
      className="rounded-[12px] border border-[var(--thermal-warning-border)] bg-[var(--thermal-warning-bg)] p-5 text-[var(--thermal-warning-ink)]"
    >
      <div className="flex items-start gap-3">
        <WarningCircle size={22} weight="bold" className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-3">
          <div>
            <h2 className="text-[1.0625rem] font-bold">Gagal Menghitung Prediksi</h2>
            <p className="mt-1 text-[0.9375rem] leading-relaxed">{message}</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[var(--thermal-warning-border)] bg-[var(--surface-primary)] px-4 text-[0.875rem] font-semibold text-[var(--thermal-warning-ink)] transition-colors hover:bg-[var(--surface-secondary)]"
            >
              <ArrowsClockwise size={17} aria-hidden="true" />
              Coba Lagi
            </button>

            {serviceMode === 'live' && (
              <button
                type="button"
                onClick={onSwitchToMock}
                className="inline-flex min-h-[44px] items-center rounded-[8px] bg-[var(--thermal-warning-ink)] px-4 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Gunakan Mode Simulasi FE
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
