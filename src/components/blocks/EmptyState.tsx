import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/lib/config';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ButtonLink } from '@/components/ui/Button';

const icons: Record<string, IconName> = {
  noReviews: 'star',
  noProjects: 'camera',
  noJobs: 'shield-check',
};

/**
 * A new business has no reviews and no photographed jobs. The page still has to be worth
 * landing on — and, in the reviews case, `aggregateRating` simply is not emitted rather
 * than a number being invented.
 */
export async function EmptyState({ kind }: { kind: 'noReviews' | 'noProjects' | 'noJobs' }) {
  const t = await getTranslations('empty');
  const tc = await getTranslations('common');
  const { contact } = siteConfig;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-card border border-line bg-surface px-6 py-14 text-center">
      <Icon name={icons[kind] ?? 'info'} size={40} className="text-ink-muted" />
      <h2 className="font-display text-xl font-semibold text-ink">{t(`${kind}.title`)}</h2>
      <p className="text-ink-soft">{t(`${kind}.body`)}</p>
      <ButtonLink href={`tel:${contact.phone}`} variant="secondary" icon="phone">
        {tc('callNow', { phone: contact.phoneDisplay })}
      </ButtonLink>
    </div>
  );
}
