'use client';

import Script from 'next/script';
import { siteConfig } from '@/lib/config';
import { useConsent } from './ConsentProvider';

/**
 * The whole compliance claim, in one component: nothing third-party is in the document
 * until `statistik` has been granted. Not deferred, not `async` — absent.
 *
 * The Playwright test in `tests/consent.spec.ts` asserts zero third-party requests before
 * a decision and after "Alle ablehnen". If this component ever renders its <Script>
 * unconditionally, that test fails and the build stops — which is the point, because the
 * claim is what we sell.
 */
export function Analytics() {
  const { choice, ready } = useConsent();
  const { features, integrations, siteUrl } = siteConfig;

  if (!ready) return null;
  if (features.analytics === 'none') return null;
  if (choice?.categories.statistik !== true) return null;

  const host = integrations.analyticsHost;
  const domain = new URL(siteUrl).hostname;

  if (features.analytics === 'plausible') {
    if (!host) return null;
    return <Script defer data-domain={domain} src={`${host}/js/script.js`} strategy="afterInteractive" />;
  }
  if (features.analytics === 'umami' && host) {
    return <Script defer data-website-id={domain} src={`${host}/script.js`} strategy="afterInteractive" />;
  }
  /**
   * GA4 is supported but never the default: it is a US transfer that has to be disclosed
   * for a site that gets a few thousand visits a month.
   *
   * The tag host is read from `integrations.analyticsHost` rather than written here, so a
   * client who enables GA4 has to declare the host as a processor — and the purity check
   * fails the build if they do not. The measurement ID goes in `analyticsMeasurementId`.
   */
  if (features.analytics === 'ga4' && host && integrations.analyticsMeasurementId) {
    const id = integrations.analyticsMeasurementId;
    return (
      <>
        <Script src={`${host}/gtag/js?id=${id}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}
        </Script>
      </>
    );
  }
  return null;
}
