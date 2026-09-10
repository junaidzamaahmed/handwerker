import { getTranslations } from 'next-intl/server';
import { siteConfig, localised } from '@/lib/config';

/**
 * Rendered from config.privacy.processors — the same array that builds the cookie
 * banner's category list. Add a script to the site without adding it here and the
 * purity check fails the build, which is what keeps this table honest.
 */
export async function ProcessorTable({ locale }: { locale: string }) {
  const t = await getTranslations('consent');
  const { processors } = siteConfig.privacy;

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-sunken">
            <th scope="col" className="border border-line px-3 py-2 font-semibold">{t('processorTable.service')}</th>
            <th scope="col" className="border border-line px-3 py-2 font-semibold">{t('processorTable.purpose')}</th>
            <th scope="col" className="border border-line px-3 py-2 font-semibold">{t('processorTable.country')}</th>
            <th scope="col" className="border border-line px-3 py-2 font-semibold">{t('processorTable.policy')}</th>
          </tr>
        </thead>
        <tbody>
          {processors.map((p) => (
            <tr key={p.name}>
              <th scope="row" className="border border-line px-3 py-2 font-medium">{p.name}</th>
              <td className="border border-line px-3 py-2 text-ink-soft">{localised(p.purpose, locale)}</td>
              <td className="border border-line px-3 py-2 text-ink-soft">{p.country}</td>
              <td className="border border-line px-3 py-2">
                <a href={p.privacyUrl} rel="noopener noreferrer" target="_blank" className="underline">
                  {p.name}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
