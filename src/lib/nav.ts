import { siteConfig } from './config';
import type { StaticPathname } from './i18n/pathnames';

export interface NavItem {
  href: StaticPathname;
  /** Key inside the `nav` message namespace. */
  labelKey: string;
}

/**
 * One source for the header, the mobile drawer, the footer and the 404 page. Feature
 * flags decide membership here and nowhere else — a link that survives its flag is how
 * a Garten client ends up with a Notdienst page in the menu.
 */
export function primaryNav(): NavItem[] {
  const { features } = siteConfig;
  const items: NavItem[] = [{ href: '/leistungen', labelKey: 'services' }];
  if (features.notdienst) items.push({ href: '/notdienst', labelKey: 'emergency' });
  items.push({ href: '/referenzen', labelKey: 'projects' });
  items.push({ href: '/ueber-uns', labelKey: 'about' });
  if (features.jobs) items.push({ href: '/jobs', labelKey: 'jobs' });
  items.push({ href: '/kontakt', labelKey: 'contact' });
  return items;
}

export function companyNav(): NavItem[] {
  const { features } = siteConfig;
  const items: NavItem[] = [
    { href: '/ueber-uns', labelKey: 'about' },
    { href: '/referenzen', labelKey: 'projects' },
  ];
  if (features.jobs) items.push({ href: '/jobs', labelKey: 'jobsAndApprenticeships' });
  if (features.blog) items.push({ href: '/ratgeber', labelKey: 'guides' });
  if (features.reviews) items.push({ href: '/bewertungen', labelKey: 'reviews' });
  items.push({ href: '/kontakt', labelKey: 'contact' });
  return items;
}

/** Always present, always one click away. revDSG expects the policy reachable everywhere. */
export function legalNav(): NavItem[] {
  return [
    { href: '/impressum', labelKey: 'imprint' },
    { href: '/datenschutz', labelKey: 'privacy' },
    { href: '/cookie-einstellungen', labelKey: 'cookieSettings' },
  ];
}
