/**
 * Translated route slugs.
 *
 * `/leistungen` and `/services` are different URLs, not the same URL behind a locale
 * prefix. This is the single highest-value i18n decision on the whole site: a German
 * page that lives at `/en/leistungen` competes for nothing in English.
 *
 * German is canonical. FR/IT are wired but intentionally point at the German slugs until
 * someone actually translates them — a half-translated URL is worse than an untranslated
 * one, because it looks finished.
 */
export const pathnames = {
  '/': '/',
  '/leistungen': { de: '/leistungen', en: '/services', fr: '/leistungen', it: '/leistungen' },
  '/leistungen/[service]': {
    de: '/leistungen/[service]', en: '/services/[service]',
    fr: '/leistungen/[service]', it: '/leistungen/[service]',
  },
  '/leistungen/[service]/[ort]': {
    de: '/leistungen/[service]/[ort]', en: '/services/[service]/[ort]',
    fr: '/leistungen/[service]/[ort]', it: '/leistungen/[service]/[ort]',
  },
  '/notdienst': { de: '/notdienst', en: '/emergency', fr: '/notdienst', it: '/notdienst' },
  '/referenzen': { de: '/referenzen', en: '/projects', fr: '/referenzen', it: '/referenzen' },
  '/referenzen/[slug]': {
    de: '/referenzen/[slug]', en: '/projects/[slug]',
    fr: '/referenzen/[slug]', it: '/referenzen/[slug]',
  },
  '/ueber-uns': { de: '/ueber-uns', en: '/about', fr: '/ueber-uns', it: '/ueber-uns' },
  '/offerte': { de: '/offerte', en: '/quote', fr: '/offerte', it: '/offerte' },
  '/kontakt': { de: '/kontakt', en: '/contact', fr: '/kontakt', it: '/kontakt' },
  '/jobs': { de: '/jobs', en: '/jobs', fr: '/jobs', it: '/jobs' },
  '/ratgeber': { de: '/ratgeber', en: '/guides', fr: '/ratgeber', it: '/ratgeber' },
  '/ratgeber/[slug]': {
    de: '/ratgeber/[slug]', en: '/guides/[slug]',
    fr: '/ratgeber/[slug]', it: '/ratgeber/[slug]',
  },
  '/bewertungen': { de: '/bewertungen', en: '/reviews', fr: '/bewertungen', it: '/bewertungen' },
  '/impressum': { de: '/impressum', en: '/legal-notice', fr: '/impressum', it: '/impressum' },
  '/datenschutz': { de: '/datenschutz', en: '/privacy', fr: '/datenschutz', it: '/datenschutz' },
  '/cookie-einstellungen': {
    de: '/cookie-einstellungen', en: '/cookie-settings',
    fr: '/cookie-einstellungen', it: '/cookie-einstellungen',
  },
} as const;

export type AppPathname = keyof typeof pathnames;

/**
 * Routes that need no params. Nav links must be one of these — a dynamic route in a nav
 * array is a runtime 404 waiting for the first client whose config enables it.
 */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;
