/**
 * The mechanism that keeps this template reusable.
 *
 * `src/**` is template-owned and identical in every client repo; `config/site.config.ts`,
 * `config/theme.css`, `content/**` and `public/**` are client-owned and never exist
 * upstream. Because the two sets are disjoint, `git merge upstream/main` cannot conflict —
 * which is what turns "fix it once, ship it to ten clients" into a 20-minute job.
 *
 * Every rule below protects that property. A hard-coded colour, phone number or German
 * sentence in `src/` is a file that a client will eventually need to edit, and the first
 * such edit is the one that breaks conflict-free merging for that client forever.
 */
import fs from 'node:fs';
import path from 'node:path';
import { siteConfig } from '../config/site.config';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const MESSAGES = path.join(SRC, 'messages');

interface Finding {
  file: string;
  line: number;
  rule: string;
  detail: string;
  fix: string;
}

const findings: Finding[] = [];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Strip comments so prose in a doc block never trips a content rule. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
}

const files = walk(SRC).filter((f) => !f.startsWith(MESSAGES));

// Hosts the template is allowed to reference: whatever the processors declare.
const declaredHosts = new Set(
  siteConfig.privacy.processors.flatMap((p) => p.hosts ?? []),
);
// next/font fetches these at BUILD time and self-hosts the result — no runtime request
// reaches them, so they are not processors. Documented rather than silently ignored.
const buildTimeOnlyHosts = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

/**
 * Server-side endpoints the template can reach only when a config value selects that
 * provider. They never appear in a browser and never see a visitor's IP. Each entry names
 * the config key that gates it — an undocumented addition here is the same defect this
 * check exists to catch.
 */
const providerHosts = new Map<string, string>([
  ['api.mailjet.com', 'integrations.mailProvider === "mailjet-eu"'],
  ['api.postmarkapp.com', 'integrations.mailProvider === "postmark-eu"'],
]);

/**
 * Hosts the visitor is NAVIGATED to by their own tap. Nothing is transmitted until they
 * act, so these are not resources the page loads. They still belong in the privacy policy
 * when enabled, which is why the list is short and explicit.
 */
const navigationHosts = new Set(['wa.me']);

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const raw = fs.readFileSync(file, 'utf8');
  const code = stripComments(raw);
  const lines = code.split('\n');

  lines.forEach((line, i) => {
    const at = (rule: string, detail: string, fix: string) =>
      findings.push({ file: rel, line: i + 1, rule, detail, fix });

    // 1. Colours must come from the token layer, or a reskin stops being a CSS swap.
    const hex = line.match(/#[0-9a-fA-F]{3,8}\b/);
    if (hex && !/\\u003c|u003c/.test(line)) {
      at('hardcoded-colour', hex[0], 'Use a semantic token: bg-brand, text-ink, border-line …');
    }
    if (/\b(rgb|rgba|hsl|hsla)\(\s*\d/.test(line)) {
      at('hardcoded-colour', line.trim().slice(0, 60), 'Use a semantic token from config/verticals/*.css');
    }

    // 2. Client data. These belong in site.config.ts and are rendered from it.
    if (/\b\+41\s?\d|\b0\d{2}\s\d{3}\s\d{2}\s\d{2}\b/.test(line)) {
      at('client-data', 'phone number', 'Read it from siteConfig.contact');
    }
    if (/[\w.-]+@[\w-]+\.[a-z]{2,}/i.test(line) && !/@\w+\//.test(line)) {
      at('client-data', 'email address', 'Read it from siteConfig.contact');
    }
    if (/\bCHE-\d{3}\.\d{3}\.\d{3}\b/.test(line)) {
      at('client-data', 'UID', 'Read it from siteConfig.legal');
    }
    if (/\b(strasse|gasse|weg)\s+\d+\b/i.test(line)) {
      at('client-data', 'street address', 'Read it from siteConfig.address');
    }

    // 3. User-facing German outside the message catalogue.
    const literals = line.match(/(['"`])((?:(?!\1)[^\\]|\\.){12,})\1/g) ?? [];
    for (const literal of literals) {
      const text = literal.slice(1, -1);
      if (!/\s/.test(text)) continue;
      if (/^[\w\s./@:#[\]-]+$/.test(text)) continue; // class names, paths, selectors
      const germanish = /[äöüÄÖÜß]/.test(text) || /\b(und|oder|der|die|das|Sie|wir|nicht|mit|für)\b/.test(text);
      if (germanish) {
        at('untranslated-string', text.slice(0, 60), 'Move it to src/messages/*.json, or to content/ if it is client copy');
      }
    }

    // 4. src/ must not import content — that would couple template code to client files.
    if (/from\s+['"](@content\/|.*\.\.\/content\/)/.test(line)) {
      at('content-import', line.trim().slice(0, 60), 'Read it through src/lib/content/* instead');
    }

    // 5. Any host src/ talks to must be declared as a processor, or the privacy policy
    //    and the cookie banner are already lying.
    for (const m of line.matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
      const host = m[1]!.toLowerCase();
      if (declaredHosts.has(host) || buildTimeOnlyHosts.has(host)) continue;
      if (providerHosts.has(host) || navigationHosts.has(host)) continue;
      if (/schema\.org|www\.w3\.org|localhost/.test(host)) continue; // vocabularies, not endpoints
      at('undeclared-host', host, 'Add it to config.privacy.processors[].hosts, or remove the call');
    }
  });
}

if (findings.length === 0) {
  console.log('✓ template purity: src/ is client-agnostic');
  process.exit(0);
}

const byRule = new Map<string, Finding[]>();
for (const f of findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);

console.error(`\n✗ template purity: ${findings.length} finding(s)\n`);
for (const [rule, list] of byRule) {
  console.error(`  ${rule} (${list.length})`);
  console.error(`  → ${list[0]!.fix}`);
  for (const f of list.slice(0, 12)) console.error(`     ${f.file}:${f.line}  ${f.detail}`);
  if (list.length > 12) console.error(`     … and ${list.length - 12} more`);
  console.error('');
}
process.exit(1);
