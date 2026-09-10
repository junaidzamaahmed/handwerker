import { siteConfig, localised } from '@/lib/config';
import { getReviewData } from '@/lib/content/reviews';
import type { Locale } from '@config/site.config.types';

const url = (path = '') => new URL(path, siteConfig.siteUrl).toString();

const dayMap: Record<number, string> = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
  5: 'Friday', 6: 'Saturday', 7: 'Sunday',
};

export function organisationId() {
  return url('#business');
}

/**
 * The base LocalBusiness node. `@type` comes from config so a plumber is a `Plumber` and
 * a landscaper a `LandscapingBusiness` — the generic `LocalBusiness` is the lazy answer
 * and it costs the rich-result eligibility that the specific subtype earns.
 *
 * `aggregateRating` is deliberately NOT set here. It is attached only where real fetched
 * reviews exist; inventing one is a policy violation, not an optimisation.
 */
export function localBusinessSchema(locale: string) {
  const { business, contact, address, hours, serviceArea, credentials, pricing, integrations } = siteConfig;
  const reviews = getReviewData();

  return {
    '@context': 'https://schema.org',
    '@type': business.schemaType,
    '@id': organisationId(),
    name: business.legalName,
    alternateName: business.displayName,
    description: localised(business.tagline, locale),
    url: url(),
    telephone: contact.phone,
    email: contact.email,
    ...(business.foundedYear ? { foundingDate: String(business.foundedYear) } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressRegion: address.canton,
      addressCountry: address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: address.geo.lat, longitude: address.geo.lng },
    areaServed: serviceArea.gemeinden.map((g) => ({
      '@type': 'City',
      name: g.name,
      ...(g.plz[0] ? { postalCode: g.plz[0] } : {}),
    })),
    openingHoursSpecification: hours.regular.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days.map((d) => dayMap[d]).filter(Boolean),
      opens: slot.opens,
      closes: slot.closes,
    })),
    ...(pricing.hourlyRateFrom ? { priceRange: `ab CHF ${pricing.hourlyRateFrom}/Std.` } : {}),
    ...(siteConfig.legal.uid ? { vatID: siteConfig.legal.mwstNumber ?? siteConfig.legal.uid } : {}),
    ...(credentials.associations.length
      ? { memberOf: credentials.associations.map((a) => ({ '@type': 'Organization', name: a.id })) }
      : {}),
    sameAs: Object.values(integrations.social ?? {}).filter(Boolean),
    ...(reviews && reviews.total > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviews.rating,
            reviewCount: reviews.total,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  slug: string;
  locale: string;
  areaName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.name,
    provider: { '@id': organisationId() },
    areaServed: opts.areaName
      ? { '@type': 'City', name: opts.areaName }
      : siteConfig.serviceArea.gemeinden.map((g) => ({ '@type': 'City', name: g.name })),
  };
}

export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: url(item.path),
    })),
  };
}

export function jobPostingSchema(job: {
  title: string;
  description: string;
  employmentType: string;
  datePosted: string;
  validThrough?: string;
}) {
  const { address, business } = siteConfig;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    employmentType: job.employmentType,
    datePosted: job.datePosted,
    ...(job.validThrough ? { validThrough: job.validThrough } : {}),
    hiringOrganization: { '@type': 'Organization', name: business.legalName, sameAs: url() },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.street,
        postalCode: address.postalCode,
        addressLocality: address.city,
        addressCountry: address.country,
      },
    },
  };
}

export function articleSchema(a: {
  title: string;
  description: string;
  datePublished: string;
  author?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.datePublished,
    author: a.author ?? siteConfig.business.owner?.name
      ? { '@type': 'Person', name: (a.author ?? siteConfig.business.owner?.name)! }
      : { '@type': 'Organization', name: siteConfig.business.legalName },
    publisher: { '@id': organisationId() },
    ...(a.image ? { image: url(a.image) } : {}),
  };
}
