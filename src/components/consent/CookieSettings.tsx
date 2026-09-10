'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useConsent } from './ConsentProvider';
import { processorsByCategory } from '@/lib/consent/categories';
import { ALL_CATEGORIES, type ConsentCategory } from '@/lib/consent/types';
import { Icon } from '@/components/ui/Icon';

export function CookieSettings() {
  const t = useTranslations('consent');
  const tc = useTranslations('common');
  const { choice, save, closeSettings } = useConsent();
  const panelRef = useRef<HTMLDivElement>(null);
  const byCategory = processorsByCategory();

  const [draft, setDraft] = useState<Record<ConsentCategory, boolean>>(() => {
    const base = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, false])) as Record<ConsentCategory, boolean>;
    return { ...base, ...(choice?.categories ?? {}), notwendig: true };
  });

  useEffect(() => {
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('button, input')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings();
      if (e.key !== 'Tab' || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]');
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [closeSettings]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-scrim/60" onClick={closeSettings} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-settings-title"
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-panel bg-surface p-6 shadow-raised sm:max-w-2xl sm:rounded-panel"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="consent-settings-title" className="font-display text-xl font-bold text-ink">
            {t('settingsTitle')}
          </h2>
          <button
            type="button"
            onClick={closeSettings}
            aria-label={tc('close')}
            className="-m-2 inline-flex size-12 items-center justify-center rounded-control text-ink"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        <ul className="mt-5 divide-y divide-line border-y border-line">
          {ALL_CATEGORIES.filter((c) => byCategory.has(c)).map((category) => {
            const locked = category === 'notwendig';
            const processors = byCategory.get(category) ?? [];
            return (
              <li key={category} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{t(`categories.${category}.label`)}</p>
                    <p className="mt-1 text-sm text-ink-soft">{t(`categories.${category}.description`)}</p>
                  </div>
                  {locked ? (
                    <span className="shrink-0 rounded-chip bg-sunken px-2 py-1 text-xs font-medium text-ink-muted">
                      {t('categories.notwendig.locked')}
                    </span>
                  ) : (
                    <label className="flex shrink-0 cursor-pointer items-center gap-2">
                      <span className="sr-only">{t(`categories.${category}.label`)}</span>
                      <input
                        type="checkbox"
                        checked={draft[category]}
                        onChange={(e) => setDraft((d) => ({ ...d, [category]: e.target.checked }))}
                        className="size-6 rounded-chip border-line-control accent-[var(--color-cta-bg)]"
                      />
                    </label>
                  )}
                </div>
                {processors.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-ink-muted">
                    {processors.map((p) => (
                      <li key={p.name}>
                        {p.name} · {p.country} ·{' '}
                        <a href={p.privacyUrl} rel="noopener noreferrer" target="_blank" className="underline">
                          {t('processorTable.policy')}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-sm text-ink-muted">{t('recordNote')}</p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => save(draft)}
            className="min-h-12 rounded-control bg-cta px-5 py-3 font-semibold text-on-cta hover:bg-cta-hover"
          >
            {t('save')}
          </button>
          <button
            type="button"
            onClick={closeSettings}
            className="min-h-12 rounded-control border border-line px-5 py-3 font-semibold text-ink"
          >
            {tc('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
