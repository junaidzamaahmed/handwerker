import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { getServices } from '@/lib/content/services';
import { getServicesIndex } from '@/lib/content/pages';
import { siteConfig, localised } from '@/lib/config';
import { Section, SectionHead } from '@/components/blocks/Section';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { CtaBand } from '@/components/blocks/CtaBand';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: t('services'),
    description: localised(siteConfig.business.tagline, locale),
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const services = await getServices(locale);
  const copy = await getServicesIndex(locale);

  return (
    <main id="inhalt">
      <JsonLd data={breadcrumbSchema([{ name: t('home'), path: '/' }, { name: t('services'), path: '/leistungen' }])} />

      <Section tone="subtle" compact>
        <SectionHead
          title={`${siteConfig.business.displayName} — ${t('services')}`}
          lead={copy?.lead}
        />
      </Section>

      <Section>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug} className="relative">
              <ServiceCard
                slug={s.slug}
                title={s.title}
                excerpt={s.excerpt}
                icon={s.icon}
                priceLabel={s.priceLabel}
              />
            </li>
          ))}
        </ul>
      </Section>

      {copy && <CtaBand title={copy.cta.title} body={copy.cta.body} />}
    </main>
  );
}
