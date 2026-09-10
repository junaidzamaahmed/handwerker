import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Icon } from '@/components/ui/Icon';

export async function ProjectCard({
  slug,
  title,
  tag,
  meta,
  cover,
  priority = false,
}: {
  slug: string;
  title: string;
  tag: string;
  meta: string;
  cover: { src: string; alt: string };
  priority?: boolean;
}) {
  const t = await getTranslations('common');
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
      {/* Explicit dimensions, always. An image without them is the main source of CLS,
          and the budget is 0.05. */}
      <Image
        src={cover.src}
        alt={cover.alt}
        width={760}
        height={480}
        sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
        priority={priority}
        className="aspect-[19/12] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="w-fit rounded-chip bg-brand-soft px-2 py-1 text-xs font-medium text-ink-brand">
          {tag}
        </span>
        <h3 className="text-lg font-semibold text-ink">
          <Link
            href={{ pathname: '/referenzen/[slug]', params: { slug } }}
            className="after:absolute after:inset-0"
          >
            {title}
          </Link>
        </h3>
        {/* Ort and year are the local-SEO payload of this card, not decoration. */}
        <p className="text-sm text-ink-muted">{meta}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-ink-link">
          {t('viewProject')}
          <Icon name="arrow-right" size={16} />
        </span>
      </div>
    </article>
  );
}
