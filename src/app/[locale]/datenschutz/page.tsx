import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { LegalPageBody } from '@/components/legal/LegalPage';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const metadata: Metadata = { title: 'Datenschutzerklärung' };

export default async function DatenschutzPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPageBody locale={locale} slug="datenschutz" />;
}
