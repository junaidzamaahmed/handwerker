import { siteConfig } from '@/lib/config';

/**
 * Fills `{{path.to.value}}` placeholders in a legal MDX template from site.config.ts.
 *
 * This is the whole point of generating the legal pages rather than writing them: the
 * Impressum, the privacy policy, the footer and the JSON-LD all read the same fields, so
 * they cannot disagree. Banner/policy inconsistency is a top FDPIC finding and it is
 * almost always caused by someone editing one of the two by hand.
 *
 * An unresolved placeholder throws at build time. A privacy policy that ships saying
 * "{{legal.uid}}" is worse than one that fails the build.
 */
export function interpolate(template: string, extra: Record<string, string> = {}): string {
  return template.replace(/\{\{([\w.]+)\}\}/g, (_match, path: string) => {
    if (path in extra) return extra[path]!;
    const value = path
      .split('.')
      .reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), siteConfig);
    if (value === undefined || value === null || value === '') {
      throw new Error(
        `Legal template references "${path}" but site.config.ts has no value for it. ` +
          `Either fill the field or remove the clause — a legal page must not ship with a gap.`,
      );
    }
    return String(value);
  });
}
