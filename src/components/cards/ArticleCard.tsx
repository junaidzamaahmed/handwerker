import Image from 'next/image';
import { useFormatter } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

export function ArticleCard({
  slug,
  title,
  category,
  excerpt,
  date,
  readingMinutes,
  cover,
  readingLabel,
}: {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readingMinutes: number;
  cover?: { src: string; alt: string };
  readingLabel: string;
}) {
  const format = useFormatter();
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
      {cover && (
        <Image
          src={cover.src}
          alt={cover.alt}
          width={760}
          height={400}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[19/10] w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-brand">{category}</p>
        <h3 className="text-lg font-semibold text-ink">
          <Link
            href={{ pathname: '/ratgeber/[slug]', params: { slug } }}
            className="after:absolute after:inset-0"
          >
            {title}
          </Link>
        </h3>
        <p className="flex-1 text-ink-soft">{excerpt}</p>
        <p className="pt-2 text-sm text-ink-muted">
          {readingLabel} ·{' '}
          <time dateTime={date}>{format.dateTime(new Date(date), 'short')}</time>
        </p>
      </div>
    </article>
  );
}
