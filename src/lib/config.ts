import { siteConfig } from '@config/site.config';
import type { Locale, SiteConfig } from '@config/site.config.types';

export { siteConfig };
export type { SiteConfig };

/** Pick a localised string out of a `Record<Locale, string>`, falling back to German. */
export function localised(value: Record<Locale, string>, locale: string): string {
  const v = value[locale as Locale];
  return v && v.length > 0 ? v : value[siteConfig.i18n.defaultLocale] ?? '';
}

/** `de` renders as `de-CH`: apostrophe thousands separator, 09.09.2026 dates. */
export function htmlLang(locale: string): string {
  return locale === 'de' ? 'de-CH' : locale;
}

/** All PLZ the business will actually drive to. Powers the quote-form gate AND areaServed. */
export function servicedPostalCodes(): Set<string> {
  return new Set(siteConfig.serviceArea.gemeinden.flatMap((g) => g.plz));
}

/**
 * WhatsApp deep link. The origin lives here rather than inline in a component so
 * `scripts/check-template-purity.ts` sees exactly one reference to it and a client who
 * enables the button has one place to point at in their privacy policy.
 *
 * Nothing is sent to Meta until the customer taps it — this is navigation, not a resource
 * load, which is why it is not gated behind consent.
 */
export const WHATSAPP_ORIGIN = 'https://wa.me';

export function whatsappHref(): string | null {
  return siteConfig.contact.whatsapp ? `${WHATSAPP_ORIGIN}/${siteConfig.contact.whatsapp}` : null;
}

export function gemeindeForPostalCode(plz: string) {
  return siteConfig.serviceArea.gemeinden.find((g) => g.plz.includes(plz));
}

/**
 * Ratings as the page locale writes them.
 *
 * `toFixed(1)` alone hard-codes an English decimal point into a German page. But
 * `Intl.NumberFormat('de-CH')` is not the answer either: CLDR gives de-CH a decimal POINT
 * (it is the currency convention — CHF 1'250.00), while Swiss prose writes a rating as
 * *4,9*, which is what `content/` says in every sentence around this number. Rendering
 * 4.9 in the stat box beside a sentence reading 4,9 is the visible bug.
 *
 * So the separator is a translated value like every other locale-specific string on the
 * site, rather than something inferred from a tag that answers a different question.
 */
export function formatRating(value: number, decimalSeparator: string): string {
  return value.toFixed(1).replace('.', decimalSeparator);
}
