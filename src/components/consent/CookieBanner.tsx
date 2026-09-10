'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useConsent } from './ConsentProvider';

/**
 * The settings modal is the largest client subtree on the site and almost nobody opens
 * it. Loading it on demand keeps it out of every page's first-load bundle; by the time a
 * visitor clicks "Einstellungen" the chunk has arrived.
 */
const CookieSettings = dynamic(() => import('./CookieSettings').then((m) => m.CookieSettings));

/**
 * Three buttons, one size, one contrast level, no pre-selection.
 *
 * "Alle ablehnen" is a filled button exactly like "Alle akzeptieren" — a dimmed or
 * text-only reject is the first thing an audit looks for, and the FDPIC's 2026 reminder
 * is explicit that the choice must be free and unambiguous. If a future redesign makes
 * accept more prominent than reject, that is a compliance regression, not a style change.
 */
export function CookieBanner() {
  const t = useTranslations('consent');
  const { needsDecision, settingsOpen, openSettings, acceptAll, rejectAll } = useConsent();

  if (!needsDecision && !settingsOpen) return null;

  return (
    <>
      {needsDecision && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
          className="fixed inset-x-0 bottom-[--hw-callbar-height] z-50 border-t border-line bg-surface shadow-sticky lg:bottom-0"
        >
          <div className="container-site py-5">
            <div className="mx-auto max-w-4xl">
              <h2 id="consent-title" className="font-display text-lg font-semibold text-ink">
                {t('title')}
              </h2>
              <p className="mt-2 text-ink-soft">{t('body')}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="min-h-12 rounded-control bg-cta px-4 py-3 font-semibold text-on-cta hover:bg-cta-hover"
                >
                  {t('acceptAll')}
                </button>
                <button
                  type="button"
                  onClick={openSettings}
                  className="min-h-12 rounded-control border border-line-brand bg-surface px-4 py-3 font-semibold text-ink-brand hover:bg-brand-soft"
                >
                  {t('settings')}
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="min-h-12 rounded-control bg-cta px-4 py-3 font-semibold text-on-cta hover:bg-cta-hover"
                >
                  {t('rejectAll')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {settingsOpen && <CookieSettings />}
    </>
  );
}
