import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/lib/config';

/**
 * Honest labelling for unsolicited pitch demos. Without this a WhatsApp recipient
 * can reasonably think the domain is already theirs.
 */
export async function DemoBar() {
  if (!siteConfig.demoMode) return null;
  const t = await getTranslations('demo');
  return (
    /**
     * Honest, but not the largest block on the page. At body size this ran to three lines
     * on a phone and pushed the headline below the fold — on the exact screen the
     * recipient opens from a WhatsApp link.
     */
    <p className="border-b border-line bg-brand-soft px-4 py-2 text-center text-xs leading-snug text-ink-soft sm:text-sm">
      {t('barText')}
    </p>
  );
}
