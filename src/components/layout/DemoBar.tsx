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
    <p className="border-b border-line bg-brand-soft px-4 py-2.5 text-center text-sm text-ink">
      {t('barText')}
    </p>
  );
}
