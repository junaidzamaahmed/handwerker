import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { siteConfig, localised } from '@/lib/config';
import { primaryNav } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';
import { MobileDrawer } from './MobileDrawer';
import { LocaleSwitcher } from './LocaleSwitcher';

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations('nav');
  const tc = await getTranslations('common');
  const items = primaryNav().map((i) => ({ ...i, label: t(i.labelKey) }));
  const { contact, business } = siteConfig;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="container-site flex items-center justify-between gap-6 py-3">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-display text-xl font-bold text-ink">{business.displayName}</span>
          <span className="text-xs text-ink-muted">{localised(business.tagline, locale)}</span>
        </Link>

        <nav aria-label={t('mainNavigation')} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-ink hover:text-ink-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <LocaleSwitcher />
          </div>
          {/* The number is a first-class element of the header, not a footer detail.
              Most trade jobs start as a phone call. */}
          <a
            href={`tel:${contact.phone}`}
            className="hidden min-h-12 items-center gap-2 rounded-control bg-cta px-4 py-2.5 font-semibold text-on-cta hover:bg-cta-hover sm:inline-flex"
          >
            <Icon name="phone" size={18} />
            {contact.phoneDisplay}
          </a>
          <a
            href={`tel:${contact.phone}`}
            aria-label={tc('callNow', { phone: contact.phoneDisplay })}
            className="inline-flex size-12 items-center justify-center rounded-control bg-cta text-on-cta sm:hidden"
          >
            <Icon name="phone" size={20} />
          </a>
          <MobileDrawer
            items={items}
            phoneHref={contact.phone}
            phoneDisplay={contact.phoneDisplay}
          />
        </div>
      </div>
    </header>
  );
}
