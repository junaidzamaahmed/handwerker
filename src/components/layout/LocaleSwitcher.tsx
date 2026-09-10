'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/routing';

const labels: Record<string, string> = { de: 'DE', en: 'EN', fr: 'FR', it: 'IT' };
const names: Record<string, string> = { de: 'Deutsch', en: 'English', fr: 'Français', it: 'Italiano' };

/**
 * Switching preserves the current page rather than dumping the visitor on the home page —
 * `usePathname` from next-intl returns the internal route, so the translated slug for the
 * target locale is resolved for us. Falling back to `/` only happens where a page has no
 * counterpart.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  if (routing.locales.length < 2) return null;

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Sprache / Language">
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-current={active ? 'true' : undefined}
            title={names[l]}
            onClick={() =>
              router.replace(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { pathname, params: params as any },
                { locale: l },
              )
            }
            className={`min-h-12 rounded-control px-2 text-sm font-semibold ${
              active ? 'text-ink' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {labels[l] ?? l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
