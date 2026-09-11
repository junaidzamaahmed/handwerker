import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { siteConfig, localised, whatsappHref } from '@/lib/config';
import { primaryNav, companyNav } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';
import { MobileDrawer } from './MobileDrawer';
import { LocaleSwitcher } from './LocaleSwitcher';

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations('nav');
  const tc = await getTranslations('common');
  const items = primaryNav().map((i) => ({ ...i, label: t(i.labelKey) }));
  /**
   * The drawer gets everything the desktop bar has, plus what only the footer carries.
   * On a phone the footer is a thousand pixels of scrolling away, so a menu that stops at
   * the five primary links hides the reviews page — which for this client is the single
   * strongest page on the site.
   */
  const primaryHrefs = new Set(items.map((i) => i.href));
  const secondary = companyNav()
    .filter((i) => !primaryHrefs.has(i.href))
    .map((i) => ({ ...i, label: t(i.labelKey) }));
  const { contact, business } = siteConfig;

  return (
    /**
     * Deliberately NOT backdrop-blur. A blurred sticky header repaints the full viewport
     * width on every scroll frame — measurable jank on the mid-range Android this
     * customer base actually browses on — and `backdrop-filter` makes the header the
     * containing block for `position: fixed` descendants, which is what broke the mobile
     * drawer. Opaque surface, one hairline border, no compositing cost.
     */
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
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
            secondary={secondary}
            phoneHref={contact.phone}
            phoneDisplay={contact.phoneDisplay}
            whatsappHref={whatsappHref()}
            title={business.displayName}
          />
        </div>
      </div>
    </header>
  );
}
