'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { computeOpenState, type OpenState } from '@/lib/hours';
import { siteConfig } from '@/lib/config';

/**
 * Why this is a client component on an otherwise static page:
 *
 * "Jetzt erreichbar" depends on the current time. A statically generated page bakes in
 * whatever was true at build time, so by morning it is lying — and a bar that claims the
 * emergency line is open at 03:00 when it isn't costs a customer and a reputation.
 *
 * So the server renders nothing here and the browser fills it in after mount. The cost is
 * a small layout-stable gap for one frame; the alternative is either a wrong answer or
 * making every page dynamic to render one line of text.
 */
export function OpenStatus({ className }: { className?: string }) {
  const t = useTranslations('emergency');
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    const update = () => setState(computeOpenState(siteConfig.hours, new Date()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!state) return <span className={className} aria-hidden />;

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <span
        className={`inline-block size-2.5 shrink-0 rounded-pill ${state.open ? 'bg-success' : 'bg-warning'}`}
        aria-hidden
      />
      {state.open
        ? t('availableNow')
        : state.opensAt
          ? t('opensAt', { time: state.opensAt })
          : t('closedNow')}
    </span>
  );
}
