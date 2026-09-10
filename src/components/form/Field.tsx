import type { ReactNode } from 'react';

/**
 * A real <label> bound by id, hint text wired through aria-describedby, and the error in
 * the same description. Placeholder-as-label is the single most common accessibility
 * failure on trade-site forms and it fails the older users this site is built for.
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: string;
  children: ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-muted">({optional})</span>}
      </label>
      <div className="mt-1.5" data-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}>
        {children}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  'w-full min-h-12 rounded-control border border-line-control bg-surface px-4 py-3 text-ink ' +
  'placeholder:text-ink-muted focus:border-line-focus';
export const inputErrorClass =
  'w-full min-h-12 rounded-control border-2 border-danger bg-surface px-4 py-3 text-ink';
