import type { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';
import { getPathname } from '@/lib/i18n/navigation';
import { siteConfig } from '@/lib/config';
import { getServices } from '@/lib/content/services';
import { getProjects } from '@/lib/content/projects';
import { getArticles } from '@/lib/content';
import type { StaticPathname } from '@/lib/i18n/pathnames';

/**
 * Every URL carries reciprocal `alternates.languages`, which is how hreflang gets emitted.
 * The `getPathname` call is what makes it correct: the English entry points at
 * `/en/services/rohrreinigung`, not at the German slug behind a prefix.
 */
function entry(href: string, locale: string, alternates: Record<string, string>, priority: number) {
  return {
    url: new URL(href, siteConfig.siteUrl).toString(),
    lastModified: new Date(),
    alternates: { languages: alternates },
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A demo that ranks for a real town competes with the businesses we want as clients.
  if (siteConfig.demoMode) return [];

  const out: MetadataRoute.Sitemap = [];
  const staticRoutes: Array<[StaticPathname, number]> = [
    ['/', 1], ['/leistungen', 0.9], ['/notdienst', 0.9], ['/referenzen', 0.7],
    ['/ueber-uns', 0.6], ['/offerte', 0.8], ['/kontakt', 0.7], ['/jobs', 0.6],
    ['/ratgeber', 0.6], ['/bewertungen', 0.5], ['/impressum', 0.2], ['/datenschutz', 0.2],
  ];

  const alternatesFor = (build: (locale: string) => string) =>
    Object.fromEntries(
      routing.locales.map((l) => [l === 'de' ? 'de-CH' : l, new URL(build(l), siteConfig.siteUrl).toString()]),
    );

  for (const [href, priority] of staticRoutes) {
    if (href === '/notdienst' && !siteConfig.features.notdienst) continue;
    if (href === '/jobs' && !siteConfig.features.jobs) continue;
    if (href === '/ratgeber' && !siteConfig.features.blog) continue;
    if (href === '/bewertungen' && !siteConfig.features.reviews) continue;
    for (const locale of routing.locales) {
      out.push(
        entry(
          getPathname({ locale, href }),
          locale,
          alternatesFor((l) => getPathname({ locale: l, href })),
          priority,
        ),
      );
    }
  }

  for (const locale of routing.locales) {
    for (const s of await getServices(locale)) {
      const href = { pathname: '/leistungen/[service]' as const, params: { service: s.slug } };
      out.push(entry(getPathname({ locale, href }), locale, alternatesFor((l) => getPathname({ locale: l, href })), 0.8));
    }
    for (const p of await getProjects(locale)) {
      const href = { pathname: '/referenzen/[slug]' as const, params: { slug: p.slug } };
      out.push(entry(getPathname({ locale, href }), locale, alternatesFor((l) => getPathname({ locale: l, href })), 0.5));
    }
    if (siteConfig.features.blog) {
      for (const a of await getArticles(locale)) {
        const href = { pathname: '/ratgeber/[slug]' as const, params: { slug: a.slug } };
        out.push(entry(getPathname({ locale, href }), locale, alternatesFor((l) => getPathname({ locale: l, href })), 0.5));
      }
    }
  }

  return out;
}
