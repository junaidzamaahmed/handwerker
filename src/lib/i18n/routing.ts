import { defineRouting } from 'next-intl/routing';
import { siteConfig } from '@config/site.config';
import { pathnames } from './pathnames';

export const routing = defineRouting({
  locales: siteConfig.i18n.locales,
  defaultLocale: siteConfig.i18n.defaultLocale,
  // The default locale has no prefix: `/leistungen`, not `/de/leistungen`. Swiss visitors
  // reach the German site at the bare domain, which is what they type and what gets linked.
  localePrefix: 'as-needed',

  /**
   * Accept-Language detection is OFF, deliberately — it is on by default in next-intl.
   *
   * Plenty of Swiss machines run an en-US browser while their owner wants German, so
   * detection guesses wrong for exactly the customers this site is for. Worse, it makes
   * a shared link change language on the way: the tradesman sends a German page to a
   * customer, the customer opens the English one. And it turns a static page into a 307
   * for every visitor whose header does not match, which costs a round trip on mobile.
   *
   * German is what the bare domain serves. English is a deliberate click.
   */
  localeDetection: false,
  pathnames,
});

export type Locale = (typeof routing.locales)[number];
