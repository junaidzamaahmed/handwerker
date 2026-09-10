import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { siteConfig, localised } from '@/lib/config';
import { companyNav, legalNav } from '@/lib/nav';
import { getServices } from '@/lib/content/services';

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');
  const tt = await getTranslations('trust');
  const ta = await getTranslations('associations');
  const { business, contact, address, legal, credentials } = siteConfig;
  const services = (await getServices(locale)).filter((s) => s.featured).slice(0, 5);

  const legalLine = [
    legal.mwstNumber,
    credentials.associations.map((a) => tt('memberOf', { association: ta(a.id) })).join(' · '),
    legal.handelsregister?.office,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <footer className="border-t border-line bg-subtle">
      <div className="container-site py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* NAP block. Rendered from config, never retyped — inconsistent NAP across
              footer, Impressum and JSON-LD is the classic local-SEO leak. */}
          <div>
            <p className="font-display text-lg font-semibold text-ink">{business.legalName}</p>
            <address className="mt-2 not-italic text-ink-soft">
              {address.street}
              <br />
              {address.postalCode} {address.city}
              <br />
              <a href={`tel:${contact.phone}`} className="hover:text-ink-link">
                {contact.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${contact.email}`} className="hover:text-ink-link">
                {contact.email}
              </a>
            </address>
          </div>

          <nav aria-labelledby="footer-services">
            <p id="footer-services" className="font-semibold text-ink">{t('services')}</p>
            <ul className="mt-2 space-y-1.5 text-ink-soft">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={{ pathname: '/leistungen/[service]', params: { service: s.slug } }} className="hover:text-ink-link">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <p id="footer-company" className="font-semibold text-ink">{t('company')}</p>
            <ul className="mt-2 space-y-1.5 text-ink-soft">
              {companyNav().map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="hover:text-ink-link">
                    {i.labelKey === 'jobsAndApprenticeships' ? t('jobsAndApprenticeships') : tn(i.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <p id="footer-legal" className="font-semibold text-ink">{t('legal')}</p>
            <ul className="mt-2 space-y-1.5 text-ink-soft">
              {legalNav().map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="hover:text-ink-link">
                    {t(i.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-ink-soft">
          {localised(business.tagline, locale)}
        </p>
        {legalLine && <p className="mt-3 text-sm text-ink-muted">{legalLine}</p>}
      </div>
    </footer>
  );
}
