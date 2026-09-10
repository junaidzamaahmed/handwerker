import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/lib/config';
import { hasEmergencyLine } from '@/lib/hours';
import { Icon } from '@/components/ui/Icon';

/**
 * The emergency band. Renders nothing at all when `features.notdienst` is off — a
 * gardener does not run a 24h call-out and a red band claiming otherwise is the first
 * lie on a site whose whole job is to be trusted.
 */
export async function NotdienstBar() {
  if (!hasEmergencyLine()) return null;
  const t = await getTranslations('emergency');
  const { contact } = siteConfig;
  const phone = contact.emergencyPhone ?? contact.phone;
  const display = contact.emergencyPhoneDisplay ?? contact.phoneDisplay;

  return (
    <div className="bg-emergency text-ink-invert">
      <div className="container-site flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <Icon name="alert-triangle" size={18} className="shrink-0" />
          {t('barMessage', { phone: display })}
        </p>
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
        >
          {t('callToAction')}
          <Icon name="arrow-right" size={16} />
        </a>
      </div>
    </div>
  );
}
