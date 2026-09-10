import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  // Demo instances are disallowed outright, not merely noindexed. A demo ranking for a
  // real Swiss town is a problem for the business we are trying to sell to.
  if (siteConfig.demoMode) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: new URL('/sitemap.xml', siteConfig.siteUrl).toString(),
    host: siteConfig.siteUrl,
  };
}
