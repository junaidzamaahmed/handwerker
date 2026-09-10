import { getTranslations } from 'next-intl/server';
import { siteConfig, whatsappHref } from '@/lib/config';
import { Link } from '@/lib/i18n/navigation';
import { Icon } from '@/components/ui/Icon';

/**
 * The single highest-converting element on the site, and the reason the mobile layout
 * exists at all. It never leaves the viewport. Every mobile page therefore reserves
 * space for it at the bottom of the document, so the last footer link is never covered.
 *
 * It sits at the END of the DOM order on purpose: visually fixed, but the last thing a
 * keyboard or screen-reader user reaches rather than the first.
 */
export async function StickyCallBar() {
  const t = await getTranslations('common');
  const { contact, features } = siteConfig;
  const whatsapp = whatsappHref();

  return (
    <>
      <div className="h-[--hw-callbar-height] lg:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-sticky lg:hidden">
        <div className="grid grid-cols-3">
          <a
            href={`tel:${contact.phone}`}
            className="flex min-h-[--hw-callbar-height] flex-col items-center justify-center gap-0.5 text-xs font-semibold text-ink-brand"
          >
            <Icon name="phone" size={22} />
            {t('call')}
          </a>
          {whatsapp ? (
            <a
              href={whatsapp}
              rel="noopener noreferrer"
              className="flex min-h-[--hw-callbar-height] flex-col items-center justify-center gap-0.5 border-x border-line text-xs font-semibold text-ink-brand"
            >
              <Icon name="whatsapp" size={22} />
              {t('whatsapp')}
            </a>
          ) : (
            <a
              href={`mailto:${contact.email}`}
              className="flex min-h-[--hw-callbar-height] flex-col items-center justify-center gap-0.5 border-x border-line text-xs font-semibold text-ink-brand"
            >
              <Icon name="mail" size={22} />
              {contact.email.split('@')[0]}
            </a>
          )}
          <Link
            href="/offerte"
            className="flex min-h-[--hw-callbar-height] flex-col items-center justify-center gap-0.5 text-xs font-semibold text-ink-brand"
          >
            <Icon name="arrow-right" size={22} />
            {features.photoUpload ? t('requestQuote').split(' ')[0] : t('requestQuote')}
          </Link>
        </div>
      </div>
    </>
  );
}
