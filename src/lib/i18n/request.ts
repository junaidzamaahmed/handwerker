import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

function isSupported(value: string | undefined): value is (typeof routing.locales)[number] {
  return value != null && (routing.locales as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isSupported(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // de-CH, not de-DE: dates render 09.09.2026 and CHF 1'250.00 with an apostrophe
    // separator. Getting this wrong is the tell that a site was built for Germany.
    timeZone: 'Europe/Zurich',
    formats: {
      dateTime: {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        long: { day: 'numeric', month: 'long', year: 'numeric' },
      },
      number: {
        currency: { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 },
      },
    },
  };
});
