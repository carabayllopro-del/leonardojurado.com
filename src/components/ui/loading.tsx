export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-16 text-sm text-neutral-500"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900"
      />
      {label}
    </div>
  );
}
