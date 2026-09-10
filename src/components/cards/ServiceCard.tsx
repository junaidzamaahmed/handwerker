import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';
import { siteConfig } from '@/lib/config';

export async function ServiceCard({
  slug,
  title,
  excerpt,
  icon,
  priceLabel,
}: {
  slug: string;
  title: string;
  excerpt: string;
  icon: IconName;
  priceLabel?: string;
}) {
  const t = await getTranslations('common');
  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-card transition-shadow hover:shadow-raised">
      <Icon name={icon} size={28} className="text-icon-accent" />
      <h3 className="mt-4 text-xl font-semibold text-ink">
        <Link
          href={{ pathname: '/leistungen/[service]', params: { service: slug } }}
          className="after:absolute after:inset-0"
        >
          {title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-ink-soft">{excerpt}</p>
      {siteConfig.features.priceTransparency && priceLabel && (
        <p className="mt-4 font-semibold text-ink-brand">{priceLabel}</p>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-link">
        {t('learnMore')}
        <Icon name="arrow-right" size={16} />
      </span>
    </article>
  );
}
