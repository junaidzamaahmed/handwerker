import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { routing } from '@/lib/i18n/routing';
import { siteConfig } from '@/lib/config';
import { getArticle, getArticles } from '@/lib/content';
import { Section, SectionHead } from '@/components/blocks/Section';
import { Prose } from '@/components/blocks/Prose';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleSchema, breadcrumbSchema } from '@/lib/schema';

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of routing.locales) {
    for (const a of await getArticles(locale)) params.push({ locale, slug: a.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = await getArticle(locale, slug);
  if (!a) return {};
  return { title: a.title, description: a.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!siteConfig.features.blog) notFound();
  const article = await getArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations('common');
  const tn = await getTranslations('nav');
  const ts = await getTranslations('sections');
  const format = await getFormatter();
  const related = (await getArticles(locale)).filter((a) => a.slug !== article.slug).slice(0, 3);

  const crumbs = [
    { name: tn('home'), path: '/' },
    { name: tn('guides'), path: '/ratgeber' },
    { name: article.title, path: `/ratgeber/${article.slug}` },
  ];

  return (
    <main id="inhalt">
      <JsonLd
        data={[
          articleSchema({
            title: article.title,
            description: article.excerpt,
            datePublished: article.date,
            author: article.author,
            image: article.cover?.src,
          }),
          breadcrumbSchema(crumbs),
        ]}
      />

      <Section compact>
        <div className="container-prose">
          <Breadcrumb items={crumbs} />
          <h1 className="mt-6 text-3xl font-bold text-ink lg:text-4xl">{article.title}</h1>
          <p className="mt-3 text-sm text-ink-muted">
            {t('readingTime', { minutes: article.readingMinutes })} ·{' '}
            <time dateTime={article.date}>{format.dateTime(new Date(article.date), 'short')}</time>
            {article.author ? ` · ${article.author}` : ''}
          </p>
        </div>
        {article.cover && (
          <Image
            src={article.cover.src}
            alt={article.cover.alt}
            width={2400}
            height={1000}
            sizes="(min-width: 1024px) 1200px, 100vw"
            priority
            className="mt-8 aspect-[12/5] w-full rounded-card object-cover"
          />
        )}
      </Section>

      <Section compact>
        <Prose>
          <MDXRemote source={article.body} />
        </Prose>
      </Section>

      {related.length > 0 && (
        <Section tone="subtle">
          <SectionHead title={ts('keepReading')} />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
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
      )}

      <CtaBand title={article.title} body={article.excerpt} />
    </main>
  );
}
