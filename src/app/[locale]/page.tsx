import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { siteConfig, whatsappHref } from '@/lib/config';
import { getHome } from '@/lib/content/pages';
import { getServices } from '@/lib/content/services';
import { getProjects } from '@/lib/content/projects';
import { getReviewData } from '@/lib/content/reviews';
import { Section, SectionHead } from '@/components/blocks/Section';
import { ProcessSteps } from '@/components/blocks/ProcessSteps';
import { ServiceAreaBlock } from '@/components/blocks/ServiceArea';
import { CtaBand } from '@/components/blocks/CtaBand';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { ReviewCard } from '@/components/cards/ReviewCard';
import { ButtonLink } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Link } from '@/lib/i18n/navigation';
import { OpenStatus } from '@/components/layout/OpenStatus';
import { JsonLd } from '@/components/seo/JsonLd';
import { localBusinessSchema } from '@/lib/schema';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const home = await getHome(locale);
  if (!home) notFound();

  const t = await getTranslations('common');
  const ts = await getTranslations('sections');
  const services = (await getServices(locale)).filter((s) => s.featured).slice(0, 6);
  const projects = (await getProjects(locale)).filter((p) => p.featured).slice(0, 3);
  const reviews = getReviewData();
  const { contact } = siteConfig;
  const whatsapp = whatsappHref();

  return (
    <main id="inhalt">
      <JsonLd data={localBusinessSchema(locale)} />

      <section className="grid bg-subtle lg:grid-cols-2 lg:items-stretch">
        <div className="container-site flex flex-col justify-center py-10 lg:max-w-none lg:px-16 lg:py-20">
          {home.hero.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-brand">
              {home.hero.eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-4xl font-bold text-ink lg:text-5xl">{home.hero.h1}</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">{home.hero.lead}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href={`tel:${contact.phone}`} icon="phone">
              {t('callNow', { phone: contact.phoneDisplay })}
            </ButtonLink>
            {whatsapp && (
              <ButtonLink href={whatsapp} variant="secondary" icon="whatsapp" rel="noopener noreferrer" target="_blank">
                {t('whatsapp')}
              </ButtonLink>
            )}
            <ButtonLink href="/offerte" variant="ghost">
              {t('requestQuote')}
            </ButtonLink>
          </div>
          <OpenStatus className="mt-5 text-sm font-medium text-ink-soft" />
          {home.hero.note && <p className="mt-2 text-sm text-ink-muted">{home.hero.note}</p>}
        </div>
        {home.hero.image && (
          <div className="relative order-first min-h-72 lg:order-none lg:min-h-[36rem]">
            <Image
              src={home.hero.image.src}
              alt={home.hero.image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}
      </section>

      <Section compact>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {home.usps.map((usp) => (
            <li key={usp.title}>
              <Icon name={usp.icon as IconName} size={28} className="text-icon-accent" />
              <h2 className="mt-3 text-xl font-semibold text-ink">{usp.title}</h2>
              <p className="mt-2 text-ink-soft">{usp.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="subtle">
        <SectionHead title={ts('whatWeDo')} lead={home.servicesLead} />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug} className="relative">
              <ServiceCard slug={s.slug} title={s.title} excerpt={s.excerpt} icon={s.icon} priceLabel={s.priceLabel} />
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link href="/leistungen" className="inline-flex items-center gap-1 font-semibold text-ink-link">
            {t('allServices')}
            <Icon name="arrow-right" size={18} />
          </Link>
        </p>
      </Section>

      <Section>
        <SectionHead title={ts('howItWorks')} />
        <div className="mt-10">
          <ProcessSteps steps={home.process} />
        </div>
      </Section>

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

      {projects.length > 0 && (
        <Section>
          <SectionHead title={ts('regionalWork')} lead={home.projectsLead} />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.slug} className="relative">
                <ProjectCard
                  slug={p.slug}
                  title={p.title}
                  tag={p.service}
                  meta={`${p.ort} · ${p.year}${p.duration ? ` · ${p.duration}` : ''}`}
                  cover={p.cover}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {reviews && reviews.reviews.length > 0 && (
        <Section tone="subtle">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead
              title={ts('reviews')}
              lead={`${reviews.rating.toFixed(1)} / 5 · ${reviews.total}`}
            />
            <Link href="/bewertungen" className="inline-flex items-center gap-1 font-semibold text-ink-link">
              {t('seeAllReviews')}
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.reviews.slice(0, 3).map((r, i) => (
              <li key={`${r.author}-${i}`}>
                <ReviewCard quote={`«${r.text}»`} author={`${r.author} · ${r.relativeTime}`} rating={r.rating} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section>
        <ServiceAreaBlock />
      </Section>

      <CtaBand title={home.cta.title} body={home.cta.body} showEmergency />
    </main>
  );
}
