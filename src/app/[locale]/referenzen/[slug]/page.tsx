import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { routing } from '@/lib/i18n/routing';
import { getProject, getProjects } from '@/lib/content/projects';
import { Section, SectionHead } from '@/components/blocks/Section';
import { Prose } from '@/components/blocks/Prose';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { ReviewCard } from '@/components/cards/ReviewCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of routing.locales) {
    for (const p of await getProjects(locale)) params.push({ locale, slug: p.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProject(locale, slug);
  if (!p) return {};
  return { title: p.title, description: p.lead ?? `${p.title} — ${p.ort}, ${p.year}` };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = await getProject(locale, slug);
  if (!project) notFound();

  const tn = await getTranslations('nav');
  const ts = await getTranslations('sections');
  const tg = await getTranslations('gallery');
  const related = (await getProjects(locale, { service: project.service }))
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);

  const crumbs = [
    { name: tn('home'), path: '/' },
    { name: tn('projects'), path: '/referenzen' },
    { name: project.title, path: `/referenzen/${project.slug}` },
  ];

  return (
    <main id="inhalt">
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <Section tone="subtle" compact>
        <Breadcrumb items={crumbs} />
        <h1 className="mt-6 max-w-4xl text-3xl font-bold text-ink lg:text-5xl">{project.title}</h1>
        {project.lead && <p className="mt-5 max-w-3xl text-lg text-ink-soft">{project.lead}</p>}
        <ul className="mt-6 flex flex-wrap gap-2">
          <li><Badge intent="brand">{project.service}</Badge></li>
          <li><Badge>{project.ort}</Badge></li>
          <li><Badge>{project.year}</Badge></li>
          {project.duration && <li><Badge>{project.duration}</Badge></li>}
          {project.badges?.map((b) => <li key={b}><Badge intent="success">{b}</Badge></li>)}
        </ul>
      </Section>

      <Section compact>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          width={2400}
          height={1260}
          sizes="(min-width: 1024px) 1200px, 100vw"
          priority
          className="aspect-[40/21] w-full rounded-card object-cover"
        />
      </Section>

      {project.beforeAfter && (
        <Section compact>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure>
              <Image
                src={project.beforeAfter.before.src}
                alt={project.beforeAfter.before.alt}
                width={1200}
                height={900}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3] w-full rounded-card object-cover"
              />
              <figcaption className="mt-2 text-sm font-medium text-ink-muted">{tg('beforeLabel')}</figcaption>
            </figure>
            <figure>
              <Image
                src={project.beforeAfter.after.src}
                alt={project.beforeAfter.after.alt}
                width={1200}
                height={900}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3] w-full rounded-card object-cover"
              />
              <figcaption className="mt-2 text-sm font-medium text-ink-muted">{tg('afterLabel')}</figcaption>
            </figure>
          </div>
        </Section>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <Section compact>
          <ul className="grid gap-4 sm:grid-cols-2">
            {project.gallery.map((img) => (
              <li key={img.src}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={1200}
                  height={900}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3] w-full rounded-card object-cover"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {project.body.trim().length > 0 && (
        <Section compact>
          <Prose>
            <MDXRemote source={project.body} />
          </Prose>
        </Section>
      )}

      {project.facts && project.facts.length > 0 && (
        <Section tone="subtle" compact>
          <div className="container-prose">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {project.facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{f.label}</dt>
                  <dd className="mt-0.5 text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>
      )}

      {project.testimonial && (
        <Section compact>
          <div className="mx-auto max-w-3xl">
            <ReviewCard quote={`«${project.testimonial.quote}»`} author={project.testimonial.author} />
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section tone="subtle">
          <SectionHead title={ts('moreWork')} />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug} className="relative">
                <ProjectCard
                  slug={p.slug}
                  title={p.title}
                  tag={p.service}
                  meta={`${p.ort} · ${p.year}`}
                  cover={p.cover}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand title={project.title} body={project.lead ?? ''} />
    </main>
  );
}
