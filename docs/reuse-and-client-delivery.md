# Reuse Model — Shipping the Same Codebase to Many Clients

The goal: client #7 should take **hours, not weeks**, and a bug fixed once should reach
all seven. That only works if reuse is *structural* — enforced by the repo layout and
CI — rather than a matter of remembering to be disciplined.

---

## 1. The one rule everything else follows from

> **Template-owned files and client-owned files never overlap.**

| Owner | Paths | Merge behaviour |
|---|---|---|
| **Template** | `src/**`, `scripts/**`, `config/site.config.types.ts`, `config/verticals/**`, `package.json`, CI | Always taken from upstream |
| **Client** | `config/site.config.ts`, `config/theme.css`, `content/**`, `public/**`, `.env` | Never exists upstream |

Because the two sets are disjoint, `git merge upstream/main` **cannot produce a
conflict.** That is the entire mechanism. Every other rule in this document exists to
protect that property.

Consequence: a security patch, a Core Web Vitals fix, or a change to the consent banner
mandated by a new FDPIC guideline is a single upstream commit plus one merge per client.
Ten clients is a 20-minute job, not a re-quote.

---

## 2. Repo topology

```
handwerk-template  (upstream, private)
  └── main ─── tags: v1.0.0, v1.1.0 …
        │
        ├── client-mueller-sanitaer   (fork; remote 'upstream' → template)
        ├── client-brunner-elektro    (fork)
        └── sanitaer.demo             (fork; demoMode: true)
```

Each client repo:

```bash
git remote add upstream git@github.com:you/handwerk-template.git
git fetch upstream && git merge upstream/main   # routine, conflict-free
```

Client repos are **forks, not branches** — separate deploy targets, separate access (a
client can be given read access without seeing every other client), separate incident
blast radius. A monorepo of tenants would fight the "deploy on their own domain" model
and give one client's bad deploy the power to break the others.

---

## 3. The three-file delivery

A standard client is **only** these:

1. **`config/site.config.ts`** — NAP, legal entity, hours, service area, credentials,
   pricing, processors, feature flags. Fully typed (`config/site.config.types.ts`), so a
   missing field is a compile error, not a blank space discovered at launch.
2. **`config/theme.css`** — semantic token overrides. Colours, fonts, radii, shadow.
3. **`content/de/**`** — MDX for services, projects, team, FAQ, jobs, Ratgeber.

Everything user-visible must resolve from one of those three. If it doesn't, that's a
defect in the template, not a reason to edit `src/`.

### Enforced by CI, not by memory

`scripts/check-template-purity.ts` fails the build when `src/**` contains:

- a hard-coded hex colour or `rgb()` — components consume semantic tokens only
- a phone number, email address, street address, or PLZ pattern
- a German or English user-facing string literal outside the i18n message catalogue
- an import from `content/`
- a `<script src>` or `fetch()` to a host absent from `config.privacy.processors`
  (this one keeps the cookie banner and privacy policy honest — see the plan, §5)

This check is the difference between a template that stays reusable and one that quietly
becomes five codebases over a year.

---

## 4. Escape hatch for the client who wants something custom

Some client will want a block nothing else needs. Two sanctioned routes, in order:

**A. Promote it into the template (preferred).** Build it as a config-driven block,
default it `off`, ship it upstream. Every future client can now be sold it. This is how
the template gets more valuable with each project instead of more fragmented.

**B. Quarantine it.** `src/components/client/` is the *only* directory under `src/` that
client repos may add files to, and it is empty upstream — so it can never conflict.
Register blocks through the existing `blocks.registry.ts` slot mechanism. A page composes
blocks from config; a custom block is one more entry.

**Never** modify an existing `src/` file in a client repo. That is the single action that
breaks conflict-free merging, and once it's done for one client it tends to be done for
all of them.

---

## 5. Versioning and the care plan

- Template releases are semver-tagged. `site.config.ts` records `templateVersion`.
- `CHANGELOG.md` distinguishes **`[compat]`** (merge and go) from **`[action]`** (needs a
  config addition — e.g. a new required legal field after a regulatory change).
- A scheduled job opens a PR on each client repo when a new tag lands, so upgrades are a
  review-and-merge rather than something you have to remember.
- This is what makes a monthly care plan honest work rather than rent: clients genuinely
  receive the security, performance and compliance improvements you build for everyone.

---

## 6. New client, start to finish

```bash
pnpm create-client mueller-sanitaer --vertical sanitaer
```

The generator scaffolds the fork, prompts for NAP/legal/hours, writes a typed
`site.config.ts`, copies the vertical theme preset, and stubs `content/de/` from the
taxonomy — leaving a checklist of what still needs real content.

Then:

| Step | Work | Est. |
|---|---|---|
| 1 | Run the generator, fill the config | 45 min |
| 2 | Theme: brand colours, logo, font pairing | 1–2 h |
| 3 | Content: services, 3–5 reference projects, team, FAQ | 3–5 h |
| 4 | Photos (client's own — see plan §8) | client-dependent |
| 5 | Legal: generated Impressum + Datenschutz, sent for client review | 30 min |
| 6 | Verification suite (plan §11), then domain + DNS | 1 h |

**Target: under two working days for a standard build.** If a delivery runs materially
over, the post-mortem question is always "what did I have to touch outside the three
files, and why isn't that in config yet?"

### Ship-blocking checklist

- [ ] `demoMode: false`, `noindex` removed, demo bar gone
- [ ] Real NAP everywhere; nothing "Muster" survives (`pnpm check:no-placeholder`)
- [ ] Every processor in `privacy.processors` actually used, and vice versa
- [ ] Impressum + Datenschutzerklärung reviewed **by the client** — issued as a template,
      not as legal advice
- [ ] Association badges only where membership is real
- [ ] Reviews real or removed; no invented `aggregateRating`
- [ ] Stock photography replaced with the client's own, or flagged to them in writing
- [ ] Lighthouse budgets, axe, consent-gating and schema tests green

---

## 7. What this buys you commercially

- **Demos cost almost nothing.** A new vertical demo is a theme file plus content — so
  you can build one aimed at a specific prospect before a meeting.
- **Price on value, deliver on leverage.** The client buys a compliant, fast, local-SEO
  site; you spend two days.
- **The care plan is defensible.** You are genuinely maintaining shared infrastructure.
- **Compliance changes become an upsell, not a fire.** When the next FDPIC guideline
  lands, you patch upstream once and tell every client it's already handled.
