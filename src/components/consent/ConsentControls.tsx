'use client';

import { useTranslations } from 'next-intl';
import { useConsent } from './ConsentProvider';
import { Alert } from '@/components/ui/Alert';

/**
 * The re-entry point required by revDSG: a visitor must be able to change or withdraw a
 * decision as easily as they gave it. Linked from the footer of every page.
 */
export function ConsentControls() {
  const t = useTranslations('consent');
  const { choice, ready, openSettings, acceptAll, rejectAll } = useConsent();

  if (!ready) return null;

  const granted = Object.entries(choice?.categories ?? {})
    .filter(([, on]) => on)
    .map(([key]) => key);

  return (
    <div className="space-y-5">
      {choice && (
        <Alert type={granted.length > 1 ? 'info' : 'success'} title={t('savedTitle')}>
          <p>
            {granted.length > 1
              ? granted.map((g) => t(`categories.${g}.label`)).join(' · ')
              : t('savedRejectedBody')}
          </p>
        </Alert>
      )}
      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={acceptAll} className="min-h-12 rounded-control bg-cta px-4 py-3 font-semibold text-on-cta hover:bg-cta-hover">
          {t('acceptAll')}
        </button>
        <button type="button" onClick={openSettings} className="min-h-12 rounded-control border border-line-brand bg-surface px-4 py-3 font-semibold text-ink-brand hover:bg-brand-soft">
          {t('settings')}
        </button>
        <button type="button" onClick={rejectAll} className="min-h-12 rounded-control bg-cta px-4 py-3 font-semibold text-on-cta hover:bg-cta-hover">
          {t('rejectAll')}
        </button>
      </div>
    </div>
  );
}
