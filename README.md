# Handwerk Template

A productised website template for Swiss and DACH trades businesses (Sanitär, Elektro,
Garten, Dach, Maler). One codebase, forked per client; a new client is three files.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · next-intl · MDX content.

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # typecheck + template purity — run before every commit
npm run build
```

## The one rule

> **Template-owned files and client-owned files never overlap.**

| Owner | Paths |
|---|---|
| **Template** | `src/**`, `scripts/**`, `config/site.config.types.ts`, `config/tokens.base.css`, `config/verticals/**` |
| **Client** | `config/site.config.ts`, `config/theme.css`, `content/**`, `public/**`, `.env` |

Because the two sets are disjoint, `git merge upstream/main` cannot conflict. That single
property is what makes "fix it once, ship it to every client" a twenty-minute job instead
of a re-quote. `npm run check:purity` fails the build if `src/` grows a hard-coded colour,
a phone number, a German sentence outside the message catalogue, an import from
`content/`, or a network call to a host absent from `privacy.processors`.

Full mechanism: [docs/reuse-and-client-delivery.md](docs/reuse-and-client-delivery.md).

## Delivering a client

1. **`config/site.config.ts`** — NAP, legal entity, hours, service area, credentials,
   pricing, processors, feature flags. Fully typed, so a missing field is a compile error
   rather than a blank space found at launch.
2. **`config/theme.css`** — swap one `@import` to pick a vertical preset; override tokens
   below it if the client has their own colours. **Re-run the contrast audit after any
   override.**
3. **`content/de/**`** — MDX for services, projects, team, jobs, Ratgeber, legal.

Nothing in `src/` should ever need editing. If a client job forces one, that is a signal
to promote the thing into config — see the escape hatch in the reuse doc.

## Layout

```
config/            client config + design tokens exported from Figma
content/de/        MDX: services, projects, team, jobs, ratgeber, legal, pages
public/media/      images (CREDITS.md records source + licence for every file)
src/app/[locale]/  routes — German slugs are canonical, English slugs are translated
src/components/    ui · cards · blocks · layout · form · consent · legal
src/lib/           config · content · i18n · schema · consent · forms · hours
src/messages/      UI chrome only — page copy lives in content/
scripts/           check-template-purity.ts
```

## What the compliance module actually does

The claim being sold is *zero third-party requests before consent*, and it is a property
of the build, not a promise:

- Fonts self-hosted via `next/font` — downloaded at build time, served from our origin.
- No Google Maps embed. A static map placeholder, always.
- Analytics is a component that renders **nothing** until `statistik` is granted.
- No reCAPTCHA — honeypot, submission timing and an IP rate limit instead.
- Cookie banner: three buttons, same size, same contrast, none pre-selected.
- Impressum and Datenschutzerklärung are **generated** from `site.config.ts`, so the
  banner and the policy read the same processor array and cannot drift.

Measured on the built home page: **0 third-party requests** before a decision, and 0
after "Alle ablehnen".

## Docs

| File | What it covers |
|---|---|
| [docs/implementation-notes.md](docs/implementation-notes.md) | Decisions taken during the build, measured numbers, open items |
| [docs/reuse-and-client-delivery.md](docs/reuse-and-client-delivery.md) | The disjoint-file-set mechanism, per-client workflow |
| [docs/component-inventory.md](docs/component-inventory.md) | Figma ↔ code map |
| [docs/service-taxonomy.md](docs/service-taxonomy.md) | 29 services across 3 verticals, page contract |
| [docs/swiss-german-style-guide.md](docs/swiss-german-style-guide.md) | de-CH rules (no ß, Offerte, Stundenansatz …) |
| [docs/figma-build-notes.md](docs/figma-build-notes.md) | Figma Plugin API gotchas from building the design |
