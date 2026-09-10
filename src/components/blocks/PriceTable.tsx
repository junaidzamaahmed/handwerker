export interface PriceRow {
  label: string;
  note?: string;
  value: string;
}

/**
 * Showing prices is the differentiator: most Swiss trade sites hide them and lose the
 * comparison before it starts. Amounts are strings, not numbers, because "ab CHF 190",
 * "+ 50 %" and "CHF 110 / h" are all legitimate and formatting them centrally would
 * force every one of them into the same shape.
 */
export function PriceTable({ rows }: { rows: PriceRow[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
          <div className="min-w-0 flex-1">
            <dt className="font-semibold text-ink">{row.label}</dt>
            {row.note && <p className="text-sm text-ink-muted">{row.note}</p>}
          </div>
          <dd className="font-semibold text-ink-brand">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
