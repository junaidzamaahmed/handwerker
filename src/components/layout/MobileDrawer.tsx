'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Icon } from '@/components/ui/Icon';
import type { NavItem } from '@/lib/nav';

/**
 * Focus is trapped while open, Esc closes, and focus returns to the trigger. Those three
 * behaviours are the entire difference between a menu and a trap for anyone using a
 * keyboard or a screen reader.
 */
export function MobileDrawer({ items, phoneHref, phoneDisplay }: {
  items: Array<NavItem & { label: string }>;
  phoneHref: string;
  phoneDisplay: string;
}) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a, button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        aria-label={t('openMenu')}
        className="inline-flex size-12 items-center justify-center rounded-control text-ink lg:hidden"
      >
        <Icon name="menu" size={26} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-scrim/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            id="mobile-drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('mainNavigation')}
            className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-surface shadow-raised"
          >
            <div className="flex items-center justify-end border-b border-line p-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label={t('closeMenu')}
                className="inline-flex size-12 items-center justify-center rounded-control text-ink"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              <ul>
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-12 items-center rounded-control px-4 py-3 text-lg font-medium text-ink hover:bg-subtle"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-line p-4">
              <a
                href={`tel:${phoneHref}`}
                className="flex min-h-12 items-center justify-center gap-2 rounded-control bg-cta px-4 py-3 font-semibold text-on-cta"
              >
                <Icon name="phone" size={20} />
                {tc('callNow', { phone: phoneDisplay })}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
