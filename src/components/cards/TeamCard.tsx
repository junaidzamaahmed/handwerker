import Image from 'next/image';

/**
 * Real faces or nothing. A stock portrait here is worse than having no team section at
 * all, because the customer meets this person afterwards. Demo builds carry a visible
 * "Beispielbilder" line above the grid.
 */
export function TeamCard({
  name,
  role,
  detail,
  photo,
}: {
  name: string;
  role: string;
  detail?: string;
  photo?: { src: string; alt: string };
}) {
  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      {photo && (
        <Image
          src={photo.src}
          alt={photo.alt}
          width={560}
          height={640}
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[7/8] w-full object-cover"
        />
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-ink">{name}</h3>
        <p className="mt-1 text-ink-soft">{role}</p>
        {detail && <p className="mt-1 text-sm text-ink-muted">{detail}</p>}
      </div>
    </article>
  );
}
