import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { getProjects } from '@/lib/content/projects';
import { getIndexCopy } from '@/lib/content/pages';
import { Section } from '@/components/blocks/Section';
import { CtaBand } from '@/components/blocks/CtaBand';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { EmptyState } from '@/components/blocks/EmptyState';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = await getIndexCopy(locale, 'referenzen');
  return { title: copy?.h1, description: copy?.lead };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = await getIndexCopy(locale, 'referenzen');
  if (!copy) notFound();
  const projects = await getProjects(locale);

  return (
    <main id="inhalt">
      <Section tone="subtle" compact>
        <h1 className="text-3xl font-bold text-ink lg:text-4xl">{copy.h1}</h1>
        <p className="mt-4 max-w-3xl text-lg text-ink-soft">{copy.lead}</p>
      </Section>

      <Section>
        {projects.length === 0 ? (
          <EmptyState kind="noProjects" />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <li key={p.slug} className="relative">
                <ProjectCard
                  slug={p.slug}
                  title={p.title}
                  tag={p.service}
                  meta={`${p.ort} · ${p.year}${p.duration ? ` · ${p.duration}` : ''}`}
                  cover={p.cover}
                  priority={i < 3}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {copy.cta && <CtaBand title={copy.cta.title} body={copy.cta.body} />}
    </main>
  );
}
