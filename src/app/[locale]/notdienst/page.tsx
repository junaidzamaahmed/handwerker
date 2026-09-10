import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { siteConfig, localised } from '@/lib/config';
import { hasEmergencyLine } from '@/lib/hours';
import { getEmergency } from '@/lib/content/pages';
import { Section, SectionHead } from '@/components/blocks/Section';
import { ProcessSteps } from '@/components/blocks/ProcessSteps';
import { PriceTable } from '@/components/blocks/PriceTable';
import { ServiceAreaBlock } from '@/components/blocks/ServiceArea';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { OpenStatus } from '@/components/layout/OpenStatus';
import { JsonLd } from '@/components/seo/JsonLd';
import { serviceSchema } from '@/lib/schema';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await getEmergency(locale);
  return { title: page?.h1, description: page?.lead };
}

export default async function EmergencyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // features.notdienst = false removes this route entirely rather than rendering an empty
  // page. A gardener has no 24h call-out and must not have a URL implying one.
  if (!hasEmergencyLine()) notFound();

  const page = await getEmergency(locale);
  if (!page) notFound();
  const t = await getTranslations('common');
  const te = await getTranslations('emergency');
  const ts = await getTranslations('sections');
  const { contact, hours } = siteConfig;
  const phone = contact.emergencyPhone ?? contact.phone;
  const display = contact.emergencyPhoneDisplay ?? contact.phoneDisplay;

  return (
    <main id="inhalt">
      <JsonLd data={serviceSchema({ name: page.h1, description: page.lead, slug: 'notdienst', locale })} />

      <Section tone="inverse">
        <Badge intent="emergency">{localised(hours.emergency.label, locale)}</Badge>
        <h1 className="mt-5 max-w-4xl text-4xl font-bold lg:text-5xl">{page.h1}</h1>
        <p className="mt-5 max-w-3xl text-lg opacity-90">{page.lead}</p>
        <p className="mt-8">
          <a href={`tel:${phone}`} className="font-display text-4xl font-bold lg:text-6xl">
            {display}
          </a>
        </p>
        <OpenStatus className="mt-3 font-medium" />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`tel:${phone}`} variant="emergency" icon="phone">
            {t('callNow', { phone: display })}
          </ButtonLink>
          <ButtonLink href="/offerte" variant="secondary">
            {t('requestQuote')}
          </ButtonLink>
        </div>
      </Section>

      <Section>
        <SectionHead title={te('immediateSteps')} />
        <div className="mt-10">
          <ProcessSteps steps={page.steps} />
        </div>
      </Section>

      <Section tone="subtle">
        <SectionHead title={ts('whatItCosts')} />
        <div className="mt-8 max-w-3xl space-y-6">
          <PriceTable rows={page.pricing} />
          <Alert type="info" title={page.pricingNote.title}>
            <p>{page.pricingNote.body}</p>
          </Alert>
        </div>
      </Section>

      <Section>
        <ServiceAreaBlock />
      </Section>

      <CtaBand title={page.cta.title} body={page.cta.body} tone="emergency" />
    </main>
  );
}
