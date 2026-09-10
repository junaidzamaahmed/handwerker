import { Icon } from '@/components/ui/Icon';

/** Two columns on desktop, one on mobile. Never two on a 375px screen — a 160px column
 *  breaks German compounds mid-word. */
export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-12">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Icon name="check" size={22} className="mt-0.5 shrink-0 text-icon-accent" />
          <span className="text-ink-soft">{item}</span>
        </li>
      ))}
    </ul>
  );
}
