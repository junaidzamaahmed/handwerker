/**
 * WCAG 2.2 contrast audit over the vertical theme presets.
 *
 * A reskin is one CSS import swap, which is exactly what makes it easy to ship a theme
 * whose brand colour fails against white. This runs the same pair list the Figma audit
 * used, so a new vertical cannot be added without clearing it.
 *
 * The pair list encodes the distinction that caused a real defect during design:
 * `border/default` is a DIVIDER and is exempt from 1.4.11, while `border/control` is a
 * control boundary and needs 3:1. They are separate tokens for that reason — do not
 * "simplify" them back together.
 */
import fs from 'node:fs';
import path from 'node:path';

type Pair = [fg: string, bg: string, min: number, what: string];

const PAIRS: Pair[] = [
  ['text/primary', 'bg/page', 4.5, 'body text'],
  ['text/primary', 'bg/subtle', 4.5, 'body text on subtle'],
  ['text/primary', 'surface/sunken', 4.5, 'body text on sunken card'],
  ['text/secondary', 'bg/page', 4.5, 'secondary text'],
  ['text/secondary', 'bg/subtle', 4.5, 'secondary text on subtle'],
  ['text/muted', 'bg/page', 4.5, 'muted text'],
  ['text/brand', 'bg/page', 4.5, 'brand text'],
  ['text/brand', 'bg/brand-subtle', 4.5, 'brand text on tint'],
  ['text/link', 'bg/page', 4.5, 'link'],
  ['text/link', 'bg/subtle', 4.5, 'link on subtle'],
  ['text/inverse', 'bg/inverse', 4.5, 'inverse text (footer)'],
  ['text/on-brand', 'bg/brand', 4.5, 'text on brand fill'],
  ['cta/fg', 'cta/bg', 4.5, 'CTA label'],
  ['cta/fg', 'cta/bg-hover', 4.5, 'CTA label, hover'],
  ['cta/emergency-fg', 'cta/emergency-bg', 4.5, 'emergency CTA label'],
  ['cta/emergency-fg', 'cta/emergency-bg-hover', 4.5, 'emergency CTA label, hover'],
  ['status/danger-fg', 'status/danger-bg', 4.5, 'danger alert'],
  ['status/success-fg', 'status/success-bg', 4.5, 'success alert'],
  ['status/warning-fg', 'status/warning-bg', 4.5, 'warning alert'],
  ['status/info-fg', 'status/info-bg', 4.5, 'info alert'],
  // 1.4.11 non-text: controls and meaningful graphics, 3:1
  ['border/control', 'bg/page', 3, 'input boundary'],
  ['border/control', 'surface/default', 3, 'input boundary on card'],
  ['border/brand', 'bg/page', 3, 'secondary button edge'],
  ['icon/brand', 'bg/page', 3, 'brand icon'],
  ['icon/default', 'bg/page', 3, 'default icon'],
  ['icon/on-brand', 'bg/brand', 3, 'icon on brand fill'],
  ['focus/ring', 'focus/ring-offset', 3, 'focus ring'],
  ['focus/ring', 'bg/page', 3, 'focus ring on page'],
];

function srgbToLinear(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`not a hex colour: ${hex}`);
  const n = parseInt(m[1]!, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(srgbToLinear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

/** `text/primary` -> `--color-text-primary` */
const varName = (token: string) => `--color-${token.replace('/', '-')}`;

function parse(css: string) {
  const out: Record<string, string> = {};
  for (const [, name, value] of css.matchAll(/(--color-[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out[name!] = value!;
  }
  return out;
}

const dir = path.join(process.cwd(), 'config', 'verticals');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.css'));

let checks = 0;
const failures: string[] = [];

for (const file of files) {
  const tokens = parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  for (const [fg, bg, min, what] of PAIRS) {
    const fgHex = tokens[varName(fg)];
    const bgHex = tokens[varName(bg)];
    if (!fgHex || !bgHex) {
      failures.push(`${file}: missing token for ${fg} on ${bg}`);
      continue;
    }
    checks += 1;
    const r = ratio(fgHex, bgHex);
    if (r < min) {
      failures.push(
        `${file}: ${what} — ${fg} (${fgHex}) on ${bg} (${bgHex}) is ${r.toFixed(2)}:1, needs ${min}:1`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`✗ contrast: ${failures.length} failure(s) across ${checks} checks\n`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
console.log(`✓ contrast: ${checks} checks across ${files.length} themes, 0 failures`);
