# Implementation Notes

Decisions taken while building, with the reasoning — and the measurements, including the
one budget that is currently missed.

---

## Measured, on the built site

Home page, production build, cold cache, compressed over the wire:

| | Before | After | Budget | |
|---|---|---|---|---|
| Fonts | 197 kB (4 files) | **81 kB (2 files)** | — | ✅ fixed |
| JavaScript | 143 kB | 143 kB | < 100 kB | ❌ **missed** |
| HTML | 20 kB | 20 kB | — | |
| CSS | 8 kB | 8 kB | — | |
| CLS | 0 | 0 | < 0.05 | ✅ |
| Third-party requests before consent | 0 | **0** | 0 | ✅ |
| Third-party after "Alle ablehnen" | 0 | **0** | 0 | ✅ |

### The font win

Two changes, both in `src/app/[locale]/layout.tsx`:

- `subsets: ['latin']` instead of `latin-ext`. German needs ä/ö/ü/é, all of which are in
  `latin`; `latin-ext` adds Central and Eastern European glyphs this site never renders.
- **No `weight` array.** Specifying weights makes `next/font` emit one static file per
  weight; omitting it emits the variable font — one file covering the whole range.

197 kB → 81 kB. On first render the fonts were the largest resource on the page, larger
than the JavaScript, so this mattered more than any JS change available.

### The JS budget is not met, and here is why

The plan set **initial JS < 100 kB**. The shared baseline alone is 103 kB gzipped before
a single line of page code:

- ~54 kB — React 19 + React DOM
- ~46 kB — Next.js App Router client runtime, next-intl client runtime, and our client
  components (consent provider, mobile drawer, locale switcher, live open/closed status)

Per page on top of that: service pages 113 kB, home 132 kB, Offerte 144 kB (the wizard).

I tried the obvious fix — lazy-loading the cookie settings modal — and it moved nothing,
because the cost is framework, not our code. **The honest options are:**

1. **Revise the budget to ~110 kB** and keep next-intl. Defensible: the pages are static
   HTML, LCP is driven by the hero image, and the JS is not render-blocking.
2. **Drop `NextIntlClientProvider`** and pass translated strings as props into the seven
   client components. Saves the next-intl client runtime and the message payload. This is
   real work and touches every client component, but it is the only change that gets the
   number materially down.

I did not pick one unilaterally — it is a product decision about how much the "loads in
under 2 seconds" sales line depends on this specific metric versus LCP, which is already
healthy. **Option 2 is the one I'd recommend if the budget is treated as a commitment.**

---

## Decisions worth knowing about

### Locale detection is off

`localeDetection: false` in `src/lib/i18n/routing.ts`. next-intl turns it on by default,
and during the build it redirected the German page to English because the browser sent
`Accept-Language: en-US`.

That default is wrong for this market three times over: plenty of Swiss machines run an
English browser while their owner wants German; a link shared by the tradesman changes
language on the way to the customer; and it turns a static page into a 307 for every
visitor whose header does not match. German is what the bare domain serves; English is a
deliberate click on the switcher.

### German slugs are canonical, English slugs are translated

`/leistungen/rohrreinigung` ↔ `/en/services/rohrreinigung`, defined in
`src/lib/i18n/pathnames.ts`. Not the same slug behind a locale prefix — a German page
living at `/en/leistungen` competes for nothing in English. The sitemap emits reciprocal
`hreflang` pointing at the translated URL, which is the part most builds get wrong.

Always import `Link` from `@/lib/i18n/navigation`, never `next/link`.

### The live open/closed status is a client component on purpose

"Jetzt erreichbar" depends on the current time, and a statically generated page bakes in
whatever was true at build time. A bar claiming the emergency line is open at 03:00 when
it is not costs a customer and a reputation. The server renders nothing there and the
browser fills it in after mount — one frame of layout-stable gap, in exchange for never
lying. `src/components/layout/OpenStatus.tsx`.

### The honeypot must not be validated by zod

First implementation had `website: z.string().max(0)`. Zod rejected filled honeypots with
a 422 naming the `website` field — telling the bot exactly what caught it. The schema now
accepts any string and the route checks it after validation, answering `200 { accepted:
false }` as though nothing happened. Same treatment for the sub-3-second timing check.

### `color/border/control` exists because `border/default` was a real WCAG failure

`border/default` is 1.31:1 — correct for a divider, a genuine 1.4.11 failure on an input
field boundary. Darkening the shared token would have passed the audit and made every card
and table rule look heavy. The token was split instead: controls get 3.03:1, dividers stay
subtle. Same shape of fix for `color/icon/on-brand` (white on the Elektro amber is 2:1).

### Ghost buttons are invalid on coloured bands

A ghost button is transparent with a brand-coloured label; on `bg-brand` it is
brand-on-brand and effectively invisible. It shipped that way once on the Leistungen CTA.
On a coloured band use `secondary` (white fill) plus a plain text link if a second action
is needed. Noted in `Button.tsx` where someone will actually read it.

### Never run `next build` while `next dev` is up

They share `.next` and the dev server ends up serving half-overwritten chunks — every
route 500s with `Cannot find module './611.js'` while the production build reports
success. It cost twenty minutes of chasing a phantom. `rm -rf .next` fixes it.

---

## What is done

- 23 routes, both locales, all rendering: home, Leistungen index + 9 service pages,
  Notdienst, Offerte, Kontakt, Referenzen index + 9 detail pages, Über uns, Jobs,
  Ratgeber index + 5 articles, Bewertungen, Impressum, Datenschutz, Cookie-Einstellungen,
  localised 404, sitemap, robots.
- Quote API with zod validation, honeypot, timing check, IP rate limit, service-area gate,
  photo attachments, Mailjet/Postmark transports. Every path exercised by hand.
- Consent module: derived categories, versioned evidence record, gated analytics.
- Generated Impressum + Datenschutzerklärung with a build-time failure on any unresolved
  placeholder.
- JSON-LD: LocalBusiness (correct subtype), Service, FAQPage, BreadcrumbList, JobPosting,
  Article. `aggregateRating` only from genuinely fetched reviews — never on the demo.
- `npm run check` — typecheck plus the purity check, which found and forced fixes to
  12 real violations I had written.

## Next, in the order I would do it

1. **Playwright suite.** The consent claim is what is being sold; I verified it by hand in
   the browser today, but it needs to be a test that fails the build. Also: the five-step
   wizard end to end, out-of-area PLZ, honeypot, and a keyboard pass on nav and drawer.
2. **The JS budget decision above.**
3. **`scripts/fetch-reviews.ts`** — build-time Google Business Profile fetch into
   `content/reviews.json`. The reader and the empty state already exist and are wired.
4. **Elektro and Garten client configs** to prove the reskin against the running code —
   the design is done for both, and the vertical CSS presets are already exported.
5. **Ort × Leistung route** (`/leistungen/[service]/[ort]`) with the thin-content guardrail
   from the plan: only generate where a real reference project and a genuinely local
   paragraph exist.
6. Lighthouse CI with the budgets enforced, and axe/pa11y across every route.
