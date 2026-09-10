import { getTranslations } from 'next-intl/server';
import { siteConfig, whatsappHref } from '@/lib/config';
import { ButtonLink } from '@/components/ui/Button';
import { Section } from './Section';
import { hasEmergencyLine } from '@/lib/hours';

/**
 * Note the button variants. On a coloured band the only legible filled button is
 * `secondary` (white fill, brand label). `ghost` is transparent with a brand-coloured
 * label and disappears — that bug shipped once already.
 */
export async function CtaBand({
  title,
  body,
  tone = 'brand',
  showEmergency = false,
}: {
  title: string;
  body: string;
  tone?: 'brand' | 'emergency' | 'inverse';
  showEmergency?: boolean;
}) {
  const t = await getTranslations('common');
  const { contact } = siteConfig;
  const emergency = showEmergency && hasEmergencyLine() && contact.emergencyPhone;
  const whatsapp = whatsappHref();

  return (
    <Section tone={tone} compact>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <h2 className="text-3xl font-bold lg:text-4xl">{title}</h2>
        <p className="text-lg opacity-90">{body}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`tel:${contact.phone}`} variant="secondary" icon="phone">
            {t('callNow', { phone: contact.phoneDisplay })}
          </ButtonLink>
          {whatsapp && (
            <ButtonLink href={whatsapp} variant="secondary" icon="whatsapp" rel="noopener noreferrer" target="_blank">
              {t('whatsapp')}
            </ButtonLink>
          )}
          {emergency && (
            <ButtonLink href={`tel:${contact.emergencyPhone}`} variant="emergency" icon="alert-triangle">
              {contact.emergencyPhoneDisplay}
            </ButtonLink>
          )}
        </div>
      </div>
    </Section>
  );
}
