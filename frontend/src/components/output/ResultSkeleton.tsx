export function ResultSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      aria-label="Memproses 21 parameter cuaca"
      className="space-y-4 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 min-[720px]:p-6"
    >
      <p className="text-[0.875rem] font-semibold text-[var(--ink-secondary)]">
        Memproses 21 parameter cuaca...
      </p>
      <div className="h-28 animate-pulse rounded-[10px] bg-[var(--surface-secondary)]" />
      <div className="h-20 animate-pulse rounded-[10px] bg-[var(--surface-secondary)]" />
    </section>
  );
}
