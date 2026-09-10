import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { getServices } from '@/lib/content/services';
import { siteConfig } from '@/lib/config';
import { getPathname } from '@/lib/i18n/navigation';
import { Section } from '@/components/blocks/Section';
import { QuoteWizard } from '@/components/form/QuoteWizard';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quote' });
  return {
    title: t('title'),
    robots: siteConfig.demoMode ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function QuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('quote');
  const services = await getServices(locale);
  const { contact, features } = siteConfig;

  return (
    <main id="inhalt">
      <Section tone="subtle">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-center text-3xl font-bold text-ink lg:text-4xl">{t('title')}</h1>
          <p className="mt-4 text-center text-lg text-ink-soft">
            {/* Five steps, or four when the client has photo upload switched off. The
                count is interpolated so the copy cannot contradict the actual form. */}
            {t('leadSteps', { count: features.photoUpload ? 5 : 4 })}
          </p>
          <div className="mt-10">
            <QuoteWizard
              services={services.map((s) => ({ slug: s.slug, title: s.title, icon: s.icon }))}
              phoneHref={contact.phone}
              phoneDisplay={contact.phoneDisplay}
              privacyHref={getPathname({ locale, href: '/datenschutz' })}
              photoUpload={features.photoUpload}
            />
          </div>
        </div>
      </Section>
    </main>
  );
}
