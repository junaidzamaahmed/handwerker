/**
 * In-memory, per-instance rate limiting. Deliberately not Redis: this form receives a
 * couple of dozen submissions a month, and adding a stateful dependency to a static site
 * would cost more than the abuse it prevents. Serverless instances are short-lived, so
 * the practical effect is throttling a burst from one IP, which is the actual threat.
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export function rateLimit(key: string): { ok: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0]!;
    return { ok: false, retryAfterSeconds: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return { ok: true };
}
