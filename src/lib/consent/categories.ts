import { siteConfig } from '@/lib/config';
import { ALL_CATEGORIES, type ConsentCategory } from './types';
import type { Processor } from '@config/site.config.types';

/**
 * The banner's category list is DERIVED from config.privacy.processors — it is never
 * written by hand. Banner/policy inconsistency (a tool in one and not the other) is a
 * top FDPIC finding, and the only reliable fix is to make both read the same array.
 *
 * A category with no processors is not shown. On the default build that means the banner
 * offers "notwendig" and "statistik" and nothing else, because there is nothing else.
 */
export function processorsByCategory(): Map<ConsentCategory, Processor[]> {
  const map = new Map<ConsentCategory, Processor[]>();
  for (const category of ALL_CATEGORIES) {
    const list = siteConfig.privacy.processors.filter((p) => p.category === category);
    if (list.length > 0) map.set(category, list);
  }
  return map;
}

export function optionalCategories(): ConsentCategory[] {
  return [...processorsByCategory().keys()].filter((c) => c !== 'notwendig');
}

/**
 * True when nothing on the site can set state or call out beyond what is strictly
 * necessary. When this holds, the banner still appears (the decision is the point) but
 * it has nothing to ask about beyond acknowledging that.
 */
export function hasNothingToConsentTo(): boolean {
  return optionalCategories().length === 0;
}
