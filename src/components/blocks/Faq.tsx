/**
 * Native <details>. No JavaScript, works before hydration, keyboard-operable for free,
 * and the browser's own find-in-page can open a closed section. A hand-rolled accordion
 * buys nothing here except a bundle and three accessibility bugs.
 */
export function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <details key={item.q} name="faq" open={i === 0} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 font-semibold text-ink marker:hidden">
            {item.q}
            <span
              aria-hidden
              className="shrink-0 text-ink-muted transition-transform group-open:rotate-180"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <p className="mt-2 max-w-3xl text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
