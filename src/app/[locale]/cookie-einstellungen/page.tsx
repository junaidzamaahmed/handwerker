import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { Section } from '@/components/blocks/Section';
import { ProcessorTable } from '@/components/legal/ProcessorTable';
import { ConsentControls } from '@/components/consent/ConsentControls';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'consent' });
  return { title: t('settingsTitle'), robots: { index: false, follow: true } };
}

export default async function CookieSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('consent');

  return (
    <main id="inhalt">
      <Section>
        <div className="container-prose">
          <h1 className="text-3xl font-bold text-ink lg:text-4xl">{t('settingsTitle')}</h1>
          <p className="mt-4 text-lg text-ink-soft">{t('body')}</p>
          <div className="mt-8">
            <ConsentControls />
          </div>
          <p className="mt-8 text-sm text-ink-muted">{t('recordNote')}</p>
        </div>
        <div className="mt-10">
          <div className="container-prose">
            <ProcessorTable locale={locale} />
          </div>
        </div>
      </Section>
    </main>
  );
}
