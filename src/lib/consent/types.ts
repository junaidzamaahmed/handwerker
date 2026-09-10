export type ConsentCategory = 'notwendig' | 'funktional' | 'statistik' | 'marketing';

export const ALL_CATEGORIES: ConsentCategory[] = ['notwendig', 'funktional', 'statistik', 'marketing'];

export interface ConsentChoice {
  /** `notwendig` is always true — it is locked in the UI and coerced here. */
  categories: Record<ConsentCategory, boolean>;
  /** ISO timestamp of the decision. Part of the evidence record. */
  decidedAt: string;
  /** Bumping config.privacy.policyVersion invalidates every stored decision. */
  policyVersion: string;
}

export const STORAGE_KEY = 'hw-consent';
