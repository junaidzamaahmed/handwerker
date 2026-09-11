import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { siteConfig, formatRating } from '@/lib/config';
import { getIndexCopy } from '@/lib/content/pages';
import { getReviewData } from '@/lib/content/reviews';
import { Section } from '@/components/blocks/Section';
import { CtaBand } from '@/components/blocks/CtaBand';
import { EmptyState } from '@/components/blocks/EmptyState';
import { ReviewCard } from '@/components/cards/ReviewCard';
import { Icon } from '@/components/ui/Icon';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = await getIndexCopy(locale, 'bewertungen');
  return { title: copy?.h1, description: copy?.lead };
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!siteConfig.features.reviews) notFound();
  const copy = await getIndexCopy(locale, 'bewertungen');
  if (!copy) notFound();
  const t = await getTranslations('common');
  const data = getReviewData();

  return (
    <main id="inhalt">
      <Section tone="subtle" compact>
        <h1 className="text-3xl font-bold text-ink lg:text-4xl">{copy.h1}</h1>
        <p className="mt-4 max-w-3xl text-lg text-ink-soft">{copy.lead}</p>

        {data && (
          <div className="mt-8 flex flex-wrap items-center gap-8 rounded-card border border-line bg-surface p-6">
            <div className="text-center">
              <p className="font-display text-5xl font-bold text-ink">{formatRating(data.rating, t('decimalSeparator'))}</p>
              <div className="mt-1 flex justify-center gap-0.5" aria-label={`${formatRating(data.rating, t('decimalSeparator'))} / 5`}>
                {Array.from({ length: 5 }, (_, i) => {
                  const earned = i < Math.round(data.rating);
                  return (
                    <Icon
                      key={i}
                      name={earned ? 'star-filled' : 'star'}
                      size={16}
                      className={earned ? 'text-warning' : 'text-line-strong'}
                    />
                  );
                })}
              </div>
            </div>
            <ul className="min-w-56 flex-1 space-y-1.5">
              {(['5', '4', '3', '2', '1'] as const).map((star) => {
                const count = data.distribution[star] ?? 0;
                const pct = data.total > 0 ? (count / data.total) * 100 : 0;
                return (
                  <li key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-16 shrink-0 text-ink-soft">{star} ★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-pill bg-sunken">
                      <span className="block h-full rounded-pill bg-warning" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-8 shrink-0 text-right text-ink-muted">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Section>

      <Section>
        {!data ? (
          <EmptyState kind="noReviews" />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.reviews.map((r, i) => (
              <li key={`${r.author}-${i}`}>
                <ReviewCard quote={`«${r.text}»`} author={`${r.author} · ${r.relativeTime}`} rating={r.rating} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {copy.cta && <CtaBand title={copy.cta.title} body={copy.cta.body} />}
    </main>
  );
}
