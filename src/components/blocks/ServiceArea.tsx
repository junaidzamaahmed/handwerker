import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/lib/config';
import { Icon } from '@/components/ui/Icon';

/**
 * Doing two jobs at once: it filters out leads outside the driving radius before they
 * cost a phone call, and the explicit PLZ list is the strongest on-page local-SEO signal
 * the site has. The array is the same one the quote form validates against, so the
 * promise and the form can never disagree.
 */
export async function ServiceAreaBlock() {
  const t = await getTranslations('serviceArea');
  const { serviceArea } = siteConfig;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-line bg-sunken p-10 text-center lg:aspect-[3/2]">
        <Icon name="map-pin" size={40} className="text-icon-accent" />
        <p className="font-semibold text-ink-soft">{t('mapLabel')}</p>
        <p className="max-w-sm text-sm text-ink-muted">{t('mapNote')}</p>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-ink lg:text-4xl">{t('heading')}</h2>
        {serviceArea.radiusKm && (
          <p className="mt-4 text-lg text-ink-soft">
            {t('radius', { city: siteConfig.address.city, km: serviceArea.radiusKm })}
          </p>
        )}
        <ul className="mt-6 flex flex-wrap gap-2">
          {serviceArea.gemeinden.map((g) => (
            <li
              key={g.name}
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-sm text-ink"
            >
              {g.plz[0]} {g.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
