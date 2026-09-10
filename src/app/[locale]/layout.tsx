import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Archivo, Inter } from 'next/font/google';
import { routing } from '@/lib/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NotdienstBar } from '@/components/layout/NotdienstBar';
import { DemoBar } from '@/components/layout/DemoBar';
import { StickyCallBar } from '@/components/layout/StickyCallBar';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { CookieBanner } from '@/components/consent/CookieBanner';
import { Analytics } from '@/components/consent/Analytics';
import { siteConfig, htmlLang, localised } from '@/lib/config';
import '../globals.css';

/**
 * next/font downloads these at BUILD time and serves them from our own origin. There is
 * no runtime request to a Google host, which is what the privacy policy claims and what
 * the consent test asserts. Do not swap this for a <link> to fonts.googleapis.com.
 */
/**
 * Two deliberate choices here, both measured:
 *
 * `subsets: ['latin']` — not `latin-ext`. German needs ä/ö/ü/é, all of which are in
 * `latin`; `latin-ext` adds Central/Eastern European glyphs this site will never render.
 *
 * No `weight` array — that makes next/font emit the VARIABLE font, one file covering every
 * weight, instead of one static file per weight. Together these took the font payload from
 * 197 kB to well under half that, which mattered more than any JS change available: on the
 * first render the fonts were the single largest resource on the page.
 */
const display = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});
const body = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tagline = localised(siteConfig.business.tagline, locale);
  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: {
      default: `${siteConfig.business.displayName} — ${tagline}`,
      template: `%s | ${siteConfig.business.displayName}`,
    },
    description: tagline,
    // A demo that ranks for a real town competes with the businesses we want as clients.
    robots: siteConfig.demoMode ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: siteConfig.business.displayName,
      locale: htmlLang(locale),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('nav');

  /**
   * next-intl v3 does not hand messages to client components automatically — without this
   * they render raw keys ("consent.acceptAll") in production, which is exactly how it
   * showed up here first.
   *
   * Only the namespaces client components actually use are shipped. Sending the whole
   * catalogue would put every server-only string into the JS payload for no benefit, and
   * the budget is 100 KB of initial JS.
   */
  const all = await getMessages();
  const clientNamespaces = ['common', 'nav', 'consent', 'quote', 'gallery', 'errors', 'emergency'];
  const clientMessages: AbstractIntlMessages = {};
  for (const ns of clientNamespaces) {
    const value = all[ns];
    if (value !== undefined) clientMessages[ns] = value;
  }

  return (
    <html lang={htmlLang(locale)} className={`${display.variable} ${body.variable}`}>
      <body className="bg-page text-ink antialiased">
        <NextIntlClientProvider messages={clientMessages}>
          <a
            href="#inhalt"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-ink focus:shadow-raised"
          >
            {t('skipToContent')}
          </a>
          <ConsentProvider>
            <NotdienstBar />
            <DemoBar />
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
            <StickyCallBar />
            <CookieBanner />
            <Analytics />
          </ConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
