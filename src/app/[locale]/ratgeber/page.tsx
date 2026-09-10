import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { siteConfig } from '@/lib/config';
import { getArticles } from '@/lib/content';
import { getIndexCopy } from '@/lib/content/pages';
import { Section } from '@/components/blocks/Section';
import { ArticleCard } from '@/components/cards/ArticleCard';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = await getIndexCopy(locale, 'ratgeber');
  return { title: copy?.h1, description: copy?.lead };
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!siteConfig.features.blog) notFound();
  const copy = await getIndexCopy(locale, 'ratgeber');
  if (!copy) notFound();
  const articles = await getArticles(locale);
  const t = await getTranslations('common');

  return (
    <main id="inhalt">
      <Section tone="subtle" compact>
        <h1 className="text-3xl font-bold text-ink lg:text-4xl">{copy.h1}</h1>
        <p className="mt-4 max-w-3xl text-lg text-ink-soft">{copy.lead}</p>
      </Section>
      <Section>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.slug} className="relative">
              <ArticleCard
                slug={a.slug}
                title={a.title}
                category={a.category}
                excerpt={a.excerpt}
                date={a.date}
                readingMinutes={a.readingMinutes}
                cover={a.cover}
                readingLabel={t('readingTime', { minutes: a.readingMinutes })}
              />
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
