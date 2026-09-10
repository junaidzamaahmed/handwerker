import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Icon } from '@/components/ui/Icon';

/**
 * The last item is the current page and is NOT a link — it is text, marked
 * `aria-current="page"`. A breadcrumb whose final crumb links to itself is a small lie
 * that screen-reader users hear on every page.
 */
export async function Breadcrumb({ items }: { items: Array<{ name: string; path: string }> }) {
  const t = await getTranslations('nav');
  return (
    <nav aria-label={t('breadcrumb')}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chevron-right" size={14} className="text-ink-muted" />}
              {last ? (
                <span aria-current="page" className="text-ink-soft">{item.name}</span>
              ) : (
                <Link href={item.path as '/'} className="text-ink-link hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
