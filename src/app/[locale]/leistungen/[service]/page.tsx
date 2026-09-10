import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { getService, getServices } from '@/lib/content/services';
import { getServicesIndex } from '@/lib/content/pages';
import { siteConfig } from '@/lib/config';
import { Section, SectionHead } from '@/components/blocks/Section';
import { Checklist } from '@/components/blocks/Checklist';
import { ProcessSteps } from '@/components/blocks/ProcessSteps';
import { PriceTable } from '@/components/blocks/PriceTable';
import { Faq } from '@/components/blocks/Faq';
import { ServiceAreaBlock } from '@/components/blocks/ServiceArea';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema';

/**
 * Every service page follows the same eight blocks, in the same order
 * (docs/service-taxonomy.md). Deviating per service is a red flag: it means the layout is
 * absorbing content that belongs in config or in the Ratgeber.
 */
export async function generateStaticParams() {
  const params: Array<{ locale: string; service: string }> = [];
  for (const locale of routing.locales) {
    for (const s of await getServices(locale)) params.push({ locale, service: s.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}): Promise<Metadata> {
  const { locale, service } = await params;
  const doc = await getService(locale, service);
  if (!doc) return {};
  return {
    title: doc.seo?.title ?? doc.title,
    description: doc.seo?.description ?? doc.excerpt,
    alternates: { canonical: `/leistungen/${doc.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}) {
  const { locale, service } = await params;
  setRequestLocale(locale);
  const doc = await getService(locale, service);
  if (!doc) notFound();

  const t = await getTranslations('common');
  const ts = await getTranslations('sections');
  const tn = await getTranslations('nav');
  const indexCopy = await getServicesIndex(locale);
  const { contact, features } = siteConfig;

  const crumbs = [
    { name: tn('home'), path: '/' },
    { name: tn('services'), path: '/leistungen' },
    { name: doc.title, path: `/leistungen/${doc.slug}` },
  ];

  return (
    <main id="inhalt">
      <JsonLd
        data={[
          serviceSchema({ name: doc.title, description: doc.excerpt, slug: doc.slug, locale }),
          breadcrumbSchema(crumbs),
          ...(doc.faq?.length ? [faqSchema(doc.faq)] : []),
        ]}
      />

      {/* 1 + 2 — H1, trust strip and the phone number, all above the fold on mobile */}
      <Section tone="subtle" compact>
        <Breadcrumb items={crumbs} />
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <h1 className="text-3xl font-bold text-ink lg:text-5xl">{doc.h1}</h1>
            <p className="mt-5 text-lg text-ink-soft">{doc.lead}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`tel:${contact.phone}`} icon="phone">
                {t('callNow', { phone: contact.phoneDisplay })}
              </ButtonLink>
              <ButtonLink href="/offerte" variant="secondary">
                {t('requestQuote')}
              </ButtonLink>
            </div>
            {doc.trust && doc.trust.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {doc.trust.map((item, i) => (
                  <li key={item}>
                    <Badge intent={i === 0 ? 'brand' : 'neutral'} icon={i === 0 ? undefined : 'check'}>
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {doc.hero && (
            <Image
              src={doc.hero.src}
              alt={doc.hero.alt}
              width={840}
              height={760}
              sizes="(min-width: 1024px) 480px, 100vw"
              priority
              className="aspect-[11/10] w-full rounded-card object-cover"
            />
          )}
        </div>
      </Section>

      {/* 3 — Das machen wir */}
      <Section>
        <SectionHead title={ts('whatWeDo')} />
        <div className="mt-8">
          <Checklist items={doc.checklist} />
        </div>
      </Section>

      {/* 4 — Was es kostet. Skipped entirely when the client opts out of price transparency. */}
      {features.priceTransparency && doc.pricing && doc.pricing.length > 0 && (
        <Section tone="subtle">
          <SectionHead title={ts('whatItCosts')} />
          <div className="mt-8 max-w-3xl">
            <PriceTable rows={doc.pricing} />
          </div>
        </Section>
      )}

      {/* 5 — So läuft es ab */}
      {doc.process && doc.process.length > 0 && (
        <Section>
          <SectionHead title={ts('howItWorks')} />
          <div className="mt-10">
            <ProcessSteps steps={doc.process} />
          </div>
        </Section>
      )}

      {/* 7 — Service-specific FAQ, which is also the FAQPage schema above */}
      {doc.faq && doc.faq.length > 0 && (
        <Section tone="subtle">
          <SectionHead title={ts('faq')} />
          <div className="mt-8 max-w-3xl">
            <Faq items={doc.faq} />
          </div>
        </Section>
      )}

      {/* 8 — Service area reminder, then the CTA band */}
      <Section>
        <ServiceAreaBlock />
      </Section>

      <CtaBand
        title={doc.h1.split('—')[0]?.trim() ?? doc.title}
        body={indexCopy?.serviceCtaBody ?? doc.lead}
        showEmergency={doc.intent === 'NOTFALL'}
      />
    </main>
  );
}
