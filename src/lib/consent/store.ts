import { siteConfig } from '@/lib/config';
import { ALL_CATEGORIES, STORAGE_KEY, type ConsentCategory, type ConsentChoice } from './types';

export function defaultChoice(granted: boolean): ConsentChoice {
  const categories = Object.fromEntries(
    ALL_CATEGORIES.map((c) => [c, c === 'notwendig' ? true : granted]),
  ) as Record<ConsentCategory, boolean>;
  return {
    categories,
    decidedAt: new Date().toISOString(),
    policyVersion: siteConfig.privacy.policyVersion,
  };
}

/**
 * Reads the stored decision. Returns null when there is none, when it is malformed, or
 * when it was made against an older policy version — in all three cases the visitor has
 * not consented to what the site does *now*, so we must ask again.
 *
 * Every access is wrapped: private mode, cleared site data and browsers configured to
 * block storage all throw here rather than returning empty.
 */
export function readConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentChoice;
    if (parsed.policyVersion !== siteConfig.privacy.policyVersion) return null;
    if (!parsed.categories || typeof parsed.categories !== 'object') return null;
    return { ...parsed, categories: { ...parsed.categories, notwendig: true } };
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {
    /* Storage unavailable. The visitor is not tracked either way, so failing closed is
       the correct outcome — we simply ask again next time. */
  }
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
