import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { siteConfig } from '@/lib/config';
import { getAbout, getHome } from '@/lib/content/pages';
import { getTeam } from '@/lib/content';
import { Section, SectionHead } from '@/components/blocks/Section';
import { Checklist } from '@/components/blocks/Checklist';
import { CtaBand } from '@/components/blocks/CtaBand';
import { TeamCard } from '@/components/cards/TeamCard';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await getAbout(locale);
  return { title: page?.h1, description: page?.lead };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = await getAbout(locale);
  if (!page) notFound();
  const home = await getHome(locale);
  const team = await getTeam(locale);
  const t = await getTranslations('common');
  const ts = await getTranslations('sections');

  return (
    <main id="inhalt">
      <Section tone="subtle">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <h1 className="text-3xl font-bold text-ink lg:text-5xl">{page.h1}</h1>
            <p className="mt-5 text-lg text-ink-soft">{page.lead}</p>
          </div>
          {page.image && (
            <Image
              src={page.image.src}
              alt={page.image.alt}
              width={1000}
              height={760}
              sizes="(min-width: 1024px) 500px, 100vw"
              priority
              className="aspect-[25/19] w-full rounded-card object-cover"
            />
          )}
        </div>
      </Section>

      <Section>
        <div className="container-prose space-y-5 text-lg text-ink-soft">
          {page.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Section>

      {home && (
        <Section tone="subtle" compact>
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {home.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-4xl font-bold text-ink-brand">{s.value}</span>
                  <span className="mt-1 block text-ink-soft">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {team.length > 0 && (
        <Section>
          <SectionHead title={ts('team')} />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <li key={m.slug}>
                <TeamCard name={m.name} role={m.role} detail={m.detail} photo={m.photo} />
              </li>
            ))}
          </ul>
          {/* Stock faces get labelled. The Card/Team rule is that a stock portrait is
              worse than no team section — on a demo the disclosure is what makes it honest. */}
          {siteConfig.demoMode && <p className="mt-6 text-sm text-ink-muted">{t('demoImages')}</p>}
        </Section>
      )}

      <Section tone="subtle">
        <SectionHead title={ts('values')} />
        <div className="mt-8">
          <Checklist items={page.values} />
        </div>
      </Section>

      <CtaBand title={page.cta.title} body={page.cta.body} />
    </main>
  );
}
