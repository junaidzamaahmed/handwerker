import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/lib/config';
import { Icon } from '@/components/ui/Icon';
import { OpenStatus } from '@/components/layout/OpenStatus';

/**
 * Doing two jobs at once: it filters out leads outside the driving radius before they
 * cost a phone call, and the explicit PLZ list is the strongest on-page local-SEO signal
 * the site has. The array is the same one the quote form validates against, so the
 * promise and the form can never disagree.
 *
 * The panel on the left used to be a grey box captioned "static map" plus a sentence
 * explaining why it was not a Google embed. That is developer-facing apology copy in the
 * customer's field of view — it draws attention to a missing feature instead of answering
 * the question the section asks. It is now an inline SVG radius diagram built from
 * `serviceArea.radiusKm`: no third-party request, no cartography we do not have, and it
 * actually shows the thing the heading promises.
 */
export async function ServiceAreaBlock() {
  const t = await getTranslations('serviceArea');
  const { serviceArea, address } = siteConfig;
  const km = serviceArea.radiusKm;

  /** Three rings at a third, two thirds and the full radius — read as distance, not map. */
  const rings = km ? [km / 3, (km * 2) / 3, km] : [];

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div className="rounded-card border border-line bg-sunken p-6 sm:p-8">
        <svg
          viewBox="0 0 320 240"
          role="img"
          aria-label={t('diagramLabel', { city: address.city, km: km ?? 0 })}
          className="mx-auto w-full max-w-sm"
        >
          {rings.map((r, i) => (
            <circle
              key={r}
              cx="160"
              cy="124"
              r={34 + i * 33}
              fill="none"
              strokeWidth="1.5"
              strokeDasharray={i === rings.length - 1 ? undefined : '4 5'}
              className="stroke-line-strong"
            />
          ))}
          {/* Softly filled innermost ring so the eye lands on the centre, not the edge. */}
          <circle cx="160" cy="124" r="34" className="fill-brand-soft" />
          <circle cx="160" cy="124" r="6" className="fill-brand" />
          {rings.map((r, i) => (
            <text
              key={`l-${r}`}
              x="160"
              y={124 - (34 + i * 33) - 7}
              textAnchor="middle"
              className="fill-ink-muted text-[11px] font-medium"
            >
              {Math.round(r)} km
            </text>
          ))}
          <text
            x="160"
            y="196"
            textAnchor="middle"
            className="fill-ink text-[15px] font-semibold"
          >
            {address.city}
          </text>
        </svg>

        <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
          <p className="flex items-start gap-2 text-ink-soft">
            <Icon name="map-pin" size={18} className="mt-0.5 shrink-0 text-icon-accent" />
            <span>
              {address.street}, {address.postalCode} {address.city}
            </span>
          </p>
          <OpenStatus className="text-ink-soft" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-ink lg:text-4xl">{t('heading')}</h2>
        {km && (
          <p className="mt-4 text-lg text-ink-soft">
            {t('radius', { city: address.city, km })}
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
        <p className="mt-6 text-sm text-ink-muted">{t('mapNote')}</p>
      </div>
    </div>
  );
}
