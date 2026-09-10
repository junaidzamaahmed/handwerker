/**
 * Four steps is the ceiling. A trades customer reading a fifth step starts wondering
 * what the catch is.
 */
export function ProcessSteps({ steps }: { steps: Array<{ title: string; body: string }> }) {
  return (
    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {steps.slice(0, 4).map((step, i) => (
        <li key={step.title} className="flex flex-col gap-3">
          <span
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-brand-soft font-display text-lg font-semibold text-ink-brand"
            aria-hidden
          >
            {i + 1}
          </span>
          <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
          <p className="text-ink-soft">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
