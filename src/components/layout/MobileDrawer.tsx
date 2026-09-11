'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Icon } from '@/components/ui/Icon';
import { LocaleSwitcher } from './LocaleSwitcher';
import type { NavItem } from '@/lib/nav';

type Item = NavItem & { label: string };

/**
 * Rendered through a portal on `document.body`, and that is not a stylistic choice.
 *
 * The header carries `backdrop-filter: blur()`. Any element with a backdrop-filter becomes
 * the containing block for `position: fixed` descendants, so a drawer rendered inside the
 * header resolved `inset-0` against the header box — a 90px-tall sliver pinned under the
 * logo instead of a full-height panel. The portal moves the drawer out of that containing
 * block (and out of the header's stacking context) entirely.
 *
 * Focus is trapped while open, Esc closes, and focus returns to the trigger. Those three
 * behaviours are the entire difference between a menu and a trap for anyone using a
 * keyboard or a screen reader.
 */
export function MobileDrawer({ items, secondary = [], phoneHref, phoneDisplay, whatsappHref, title }: {
  items: Item[];
  /** Links that earn a place in the menu but not in the desktop bar — reviews, legal. */
  secondary?: Item[];
  phoneHref: string;
  phoneDisplay: string;
  whatsappHref: string | null;
  title: string;
}) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  /**
   * Drives the slide-in as a TRANSITION rather than a keyframe animation. A keyframe
   * animation that never gets a frame — a throttled or backgrounded tab — leaves the
   * panel parked at `translateX(100%)`, i.e. open but invisible off-screen. A transition
   * degrades to an instant jump to the final state instead, which is the failure mode you
   * want. Flipped on the frame after mount so the browser has a start value to animate
   * from.
   */
  const [shown, setShown] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

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
    /**
     * `position: fixed` on the body rather than `overflow: hidden`, because iOS Safari
     * ignores the latter and scrolls the page behind an open drawer. The scroll offset is
     * restored on close so the visitor lands back where they were.
     */
    const y = window.scrollY;
    const { body } = document;
    const previous = body.style.cssText;
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.cssText = previous;
      window.scrollTo(0, y);
    };
  }, [open]);

  const drawer = (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className={`absolute inset-0 bg-scrim/60 transition-opacity duration-200 motion-reduce:transition-none ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        id="mobile-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('mainNavigation')}
        className={`absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] flex-col bg-surface shadow-raised transition-transform duration-200 ease-out motion-reduce:transition-none ${
          shown ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line py-2 pl-4 pr-2">
          <span className="font-display text-lg font-bold text-ink">{title}</span>
          <button
            type="button"
            onClick={close}
            aria-label={t('closeMenu')}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-control text-ink hover:bg-subtle"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain p-2">
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-between gap-3 rounded-control px-4 py-3 text-lg font-medium text-ink hover:bg-subtle"
                >
                  {item.label}
                  <Icon name="chevron-right" size={18} className="text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>

          {secondary.length > 0 && (
            <ul className="mt-2 border-t border-line pt-2">
              {secondary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center rounded-control px-4 py-2.5 text-ink-soft hover:bg-subtle hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Every public review of this trade's customers is written in English. On mobile
            the desktop switcher is hidden, so without this there is no way to reach /en. */}
        {/* Closing on the way out is belt and braces: today the locale switch remounts the
            header and the drawer resets itself, but that is a side effect of how the route
            change happens, not a guarantee. */}
        <div
          className="flex items-center justify-between gap-3 border-t border-line px-4 py-1"
          onClick={() => setOpen(false)}
        >
          <span className="text-sm font-medium text-ink-muted">{t('language')}</span>
          <LocaleSwitcher />
        </div>

        <div className="grid grid-cols-1 gap-2 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <a
            href={`tel:${phoneHref}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-control bg-cta px-4 py-3 font-semibold text-on-cta hover:bg-cta-hover"
          >
            <Icon name="phone" size={20} />
            {tc('callNow', { phone: phoneDisplay })}
          </a>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-control border border-line-strong px-4 py-3 font-semibold text-ink hover:bg-subtle"
            >
              <Icon name="whatsapp" size={20} />
              {tc('whatsapp')}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        aria-label={t('openMenu')}
        className="inline-flex size-12 items-center justify-center rounded-control text-ink hover:bg-subtle lg:hidden"
      >
        <Icon name="menu" size={26} />
      </button>

      {mounted && open && createPortal(drawer, document.body)}
    </>
  );
}
