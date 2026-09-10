import type { ReactNode } from 'react';

type Tone = 'page' | 'subtle' | 'brand' | 'inverse' | 'emergency';

const tones: Record<Tone, string> = {
  page: 'bg-page text-ink',
  subtle: 'bg-subtle text-ink',
  brand: 'bg-brand text-on-brand',
  inverse: 'bg-inverse text-ink-invert',
  emergency: 'bg-emergency text-ink-invert',
};

/**
 * One vertical rhythm for the whole site. Sections alternate tone rather than adding
 * borders — on a long trades page, dividers accumulate into visual noise.
 */
export function Section({
  children,
  tone = 'page',
  className,
  id,
  compact,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  compact?: boolean;
}) {
  return (
    <section id={id} className={`${tones[tone]} ${compact ? 'py-10 lg:py-14' : 'py-14 lg:py-24'} ${className ?? ''}`}>
      <div className="container-site">{children}</div>
    </section>
  );
}

export function SectionHead({
  title,
  lead,
  tone = 'page',
}: {
  title: string;
  lead?: string;
  tone?: Tone;
}) {
  const leadTone = tone === 'brand' || tone === 'inverse' || tone === 'emergency' ? 'opacity-90' : 'text-ink-soft';
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-bold lg:text-4xl">{title}</h2>
      {lead && <p className={`mt-4 text-lg ${leadTone}`}>{lead}</p>}
    </div>
  );
}
