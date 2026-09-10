import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/lib/config';
import { Link } from '@/lib/i18n/navigation';
import { primaryNav } from '@/lib/nav';
import { Section } from '@/components/blocks/Section';
import { ButtonLink } from '@/components/ui/Button';

/**
 * The 404 carries the phone number. Someone who lands here has a problem and a broken
 * link; the cheapest fix for both of us is a call.
 */
export default async function NotFound() {
  const t = await getTranslations('errors');
  const tc = await getTranslations('common');
  const tn = await getTranslations('nav');
  const { contact } = siteConfig;

  return (
    <main id="inhalt">
      <Section>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <p className="font-display text-6xl font-bold text-ink-brand lg:text-8xl">404</p>
          <h1 className="text-2xl font-bold text-ink lg:text-3xl">{t('notFoundTitle')}</h1>
          <p className="text-lg text-ink-soft">{t('notFoundBody')}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`tel:${contact.phone}`} icon="phone">
              {tc('callNow', { phone: contact.phoneDisplay })}
            </ButtonLink>
            <ButtonLink href="/" variant="secondary">{t('backHome')}</ButtonLink>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold text-ink">{t('notFoundLinks')}</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {primaryNav().map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block rounded-pill border border-line bg-surface px-4 py-2 text-sm text-ink-link">
                    {tn(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </main>
  );
}
