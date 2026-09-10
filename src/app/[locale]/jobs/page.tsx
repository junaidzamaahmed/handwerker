import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { routing } from '@/lib/i18n/routing';
import { siteConfig } from '@/lib/config';
import { getJobs } from '@/lib/content';
import { getIndexCopy } from '@/lib/content/pages';
import { Section, SectionHead } from '@/components/blocks/Section';
import { CtaBand } from '@/components/blocks/CtaBand';
import { EmptyState } from '@/components/blocks/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { JsonLd } from '@/components/seo/JsonLd';
import { jobPostingSchema } from '@/lib/schema';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = await getIndexCopy(locale, 'jobs');
  return { title: copy?.h1, description: copy?.lead };
}

export default async function JobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!siteConfig.features.jobs) notFound();

  const copy = await getIndexCopy(locale, 'jobs');
  if (!copy) notFound();
  const jobs = await getJobs(locale);
  const ts = await getTranslations('sections');

  return (
    <main id="inhalt">
      {/* One JobPosting per listing. This is what puts a Lehrstelle into Google Jobs —
          and it is the reason a firm that will not pay for "a website" pays for this one. */}
      {jobs.length > 0 && (
        <JsonLd
          data={jobs.map((j) =>
            jobPostingSchema({
              title: j.title,
              description: j.body,
              employmentType: j.employmentType,
              datePosted: j.datePosted,
              validThrough: j.validThrough,
            }),
          )}
        />
      )}

      <Section tone="subtle" compact>
        <h1 className="text-3xl font-bold text-ink lg:text-4xl">{copy.h1}</h1>
        <p className="mt-4 max-w-3xl text-lg text-ink-soft">{copy.lead}</p>
      </Section>

      <Section>
        <SectionHead title={ts('openPositions')} />
        {jobs.length === 0 ? (
          <div className="mt-10"><EmptyState kind="noJobs" /></div>
        ) : (
          <ul className="mt-10 space-y-6">
            {jobs.map((job) => (
              <li key={job.slug} className="rounded-card border border-line bg-surface p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge intent={job.apprenticeship ? 'brand' : 'neutral'}>{job.badge}</Badge>
                  <Badge>{job.workload}</Badge>
                  <Badge>{job.start}</Badge>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-ink">{job.title}</h3>
                <div className="mt-2 text-ink-soft">
                  <MDXRemote source={job.body} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {copy.cta && <CtaBand title={copy.cta.title} body={copy.cta.body} />}
    </main>
  );
}
