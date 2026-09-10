import type { ReactNode } from 'react';

/**
 * Long-form typography. Constrained to `--hw-container-prose` (680px) because a legal
 * page at full container width is 130 characters per line and unreadable.
 */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className="prose container-prose text-ink-soft
        [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink
        [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink
        [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1.5
        [&_a]:text-ink-link [&_strong]:text-ink
        [&_code]:rounded-chip [&_code]:bg-sunken [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm"
    >
      {children}
    </div>
  );
}
