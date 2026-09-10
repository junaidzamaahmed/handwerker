import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { siteConfig, whatsappHref } from '@/lib/config';
import { hasEmergencyLine } from '@/lib/hours';
import { getContact } from '@/lib/content/pages';
import { Section } from '@/components/blocks/Section';
import { ServiceAreaBlock } from '@/components/blocks/ServiceArea';
import { Alert } from '@/components/ui/Alert';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ButtonLink } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';
import { localBusinessSchema } from '@/lib/schema';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await getContact(locale);
  return { title: page?.h1, description: page?.lead };
}

const DAY_KEYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = await getContact(locale);
  if (!page) notFound();
  const t = await getTranslations('contact');
  const tc = await getTranslations('common');
  const { contact, address, hours } = siteConfig;
  const whatsapp = whatsappHref();

  const rows: Array<{ icon: IconName; label: string; lines: string[]; href?: string }> = [
    { icon: 'map-pin', label: t('address'), lines: [address.street, `${address.postalCode} ${address.city}`] },
    { icon: 'phone', label: t('phone'), lines: [contact.phoneDisplay], href: `tel:${contact.phone}` },
    { icon: 'mail', label: t('email'), lines: [contact.email], href: `mailto:${contact.email}` },
    {
      icon: 'clock',
      label: t('hours'),
      lines: hours.regular.map((slot) => {
        const days = slot.days.map((d) => DAY_KEYS[d - 1]).filter(Boolean);
        const span = days.length > 1 ? `${days[0]}–${days[days.length - 1]}` : days[0];
        return `${span} ${slot.opens}–${slot.closes}`;
      }),
    },
  ];

  return (
    <main id="inhalt">
      <JsonLd data={localBusinessSchema(locale)} />
      <Section>
        <h1 className="text-3xl font-bold text-ink lg:text-4xl">{page.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">{page.lead}</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">{siteConfig.business.legalName}</h2>
            <dl className="mt-5 space-y-5">
              {rows.map((row) => (
                <div key={row.label} className="flex gap-3">
                  <Icon name={row.icon} size={22} className="mt-0.5 shrink-0 text-icon-accent" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{row.label}</dt>
                    <dd className="mt-0.5 text-ink">
                      {row.href ? (
                        <a href={row.href} className="hover:text-ink-link">{row.lines[0]}</a>
                      ) : (
                        row.lines.map((l) => <span key={l} className="block">{l}</span>)
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            {hasEmergencyLine() && contact.emergencyPhone && (
              <div className="mt-6">
                <Alert type="warning" title={t('outsideHoursTitle')}>
                  <p>{t('outsideHoursBody', { phone: contact.emergencyPhoneDisplay ?? contact.phoneDisplay })}</p>
                </Alert>
              </div>
            )}
            {page.directions && (
              <p className="mt-5 text-sm text-ink-muted">
                <strong className="text-ink">{t('directions')}:</strong> {page.directions}
              </p>
            )}
          </div>

          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">{t('writeMessage')}</h2>
            <p className="mt-3 text-ink-soft">{t('formLead')}</p>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonLink href="/offerte" icon="arrow-right" fullWidth>
                {tc('requestQuote')}
              </ButtonLink>
              <ButtonLink href={`tel:${contact.phone}`} variant="secondary" icon="phone" fullWidth>
                {tc('callNow', { phone: contact.phoneDisplay })}
              </ButtonLink>
              {whatsapp && (
                <ButtonLink href={whatsapp} variant="secondary" icon="whatsapp" fullWidth rel="noopener noreferrer" target="_blank">
                  {tc('whatsapp')}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="subtle">
        <ServiceAreaBlock />
      </Section>
    </main>
  );
}
